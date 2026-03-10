import { FastifyInstance } from "fastify";

import { env } from "../../../common/config/env";
import { features } from "../../../common/config/features";
import { createLinkController } from "../controllers/create-link.controller";
import { createLinkSchema } from "../schemas/create-link.schema";

export async function linksRoutes(app: FastifyInstance) {
  app.post("/v1/links", {
    schema: {
      ...createLinkSchema,
      tags: ["Links"],
      summary: "Create a short link",
      description: "Creates a new short URL for a provided long URL.",
    },
    config: features.rateLimitEnabled
      ? {
          rateLimit: {
            max: env.CREATE_LINK_RATE_LIMIT_MAX,
            timeWindow: `${env.RATE_LIMIT_WINDOW_MINUTES} minute`,
          },
        }
      : undefined,
    handler: createLinkController,
  });
}
