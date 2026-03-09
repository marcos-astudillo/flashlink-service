import { FastifyInstance } from "fastify";

import { redirectController } from "../controllers/redirect.controller";

export async function redirectRoutes(app: FastifyInstance) {
  app.get("/:code", redirectController);
}
