import { FastifyInstance } from "fastify";

import { createLinkController } from "../controllers/create-link.controller";
import { createLinkSchema } from "../schemas/create-link.schema";

export async function linksRoutes(app: FastifyInstance) {
  app.post("/v1/links", {
    schema: createLinkSchema,
    handler: createLinkController,
  });
}
