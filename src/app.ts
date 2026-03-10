import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { env } from "./common/config/env";
import { features } from "./common/config/features";
import { HttpError } from "./common/errors/http-error";
import { registerSwagger } from "./common/plugins/swagger";
import { registerOpenApiRoute } from "./common/plugins/openapi-route";
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

export async function buildApp() {
  const app = Fastify({
    routerOptions: {
      ignoreTrailingSlash: true,
    },
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

  await app.register(cors);
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  });

  if (features.rateLimitEnabled) {
    await app.register(rateLimit, {
      global: false,
      max: env.RATE_LIMIT_MAX,
      timeWindow: `${env.RATE_LIMIT_WINDOW_MINUTES} minute`,
    });
  }

  await registerSwagger(app);
  await registerOpenApiRoute(app);

  app.get(healthRoute.url, {
    schema: healthRoute.schema,
    handler: healthController,
  });

  await app.register(linksRoutes);
  await app.register(redirectRoutes);

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

  await app.ready();

  return app;
}
