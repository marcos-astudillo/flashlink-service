import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { env } from "./common/config/env";
import { features } from "./common/config/features";
import { HttpError } from "./common/errors/http-error";
import { healthRoute } from "./health/health.route";
import { healthController } from "./health/health.controller";
import { linksRoutes } from "./modules/links/routes/links.route";
import { redirectRoutes } from "./modules/redirect/routes/redirect.route";

function isErrorWithStatusCode(
  error: unknown,
): error is { statusCode: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV !== "production"
          ? {
              target: "pino-pretty",
            }
          : undefined,
    },
  });

  app.register(cors);
  app.register(helmet);

  if (features.rateLimitEnabled) {
    app.register(rateLimit, {
      global: false,
      max: env.RATE_LIMIT_MAX,
      timeWindow: `${env.RATE_LIMIT_WINDOW_MINUTES} minute`,
    });
  }

  app.get(healthRoute.url, async () => {
    return healthController();
  });

  app.register(linksRoutes);
  app.register(redirectRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({
        message: error.message,
      });
    }

    if (isErrorWithStatusCode(error)) {
      return reply.status(error.statusCode).send({
        message: error.message,
      });
    }

    app.log.error(error);

    return reply.status(500).send({
      message: "Internal server error",
    });
  });

  return app;
}
