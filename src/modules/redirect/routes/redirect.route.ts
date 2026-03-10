import { FastifyInstance } from "fastify";

import { env } from "../../../common/config/env";
import { features } from "../../../common/config/features";
import { redirectController } from "../controllers/redirect.controller";

export async function redirectRoutes(app: FastifyInstance) {
  app.get("/:code", {
    schema: {
      tags: ["Redirect"],
      summary: "Resolve and redirect short code",
      description:
        "Looks up the short code and returns an HTTP 302 redirect to the original URL.",
      params: {
        type: "object",
        required: ["code"],
        properties: {
          code: {
            type: "string",
          },
        },
      },
      response: {
        302: {
          type: "null",
          description: "Redirect response",
        },
        404: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },
        410: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },
      },
    },
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
