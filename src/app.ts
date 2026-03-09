import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { healthRoute } from "./health/health.route";
import { healthController } from "./health/health.controller";
import { linksRoutes } from "./modules/links/routes/links.route";

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

  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  app.get(healthRoute.url, async () => {
    return healthController();
  });

  app.register(linksRoutes);

  return app;
}
