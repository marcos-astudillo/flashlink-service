import { FastifyInstance } from "fastify";

import { env } from "../../../common/config/env";
import { features } from "../../../common/config/features";
import { redirectController } from "../controllers/redirect.controller";

export async function redirectRoutes(app: FastifyInstance) {
  app.get("/:code", {
    config: features.rateLimitEnabled
      ? {
          rateLimit: {
            max: env.REDIRECT_RATE_LIMIT_MAX,
            timeWindow: `${env.RATE_LIMIT_WINDOW_MINUTES} minute`,
          },
        }
      : undefined,
    handler: redirectController,
  });
}
