import { FastifyInstance } from "fastify";

export async function registerOpenApiRoute(app: FastifyInstance) {
  app.get("/openapi.json", {
    schema: {
      hide: true,
    },
    handler: async (_request, reply) => {
      const specification = app.swagger();

      return reply
        .type("application/json; charset=utf-8")
        .send(JSON.stringify(specification, null, 2));
    },
  });
}
