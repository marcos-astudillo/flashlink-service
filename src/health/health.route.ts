export const healthRoute = {
  url: "/health",
  schema: {
    hide: true,
    tags: ["Health"],
    summary: "Health check",
    description:
      "Returns service health plus infrastructure dependency status.",
    response: {
      200: {
        type: "object",
        properties: {
          status: { type: "string" },
          service: { type: "string" },
          checks: {
            type: "object",
            properties: {
              database: { type: "string" },
              redis: { type: "string" },
            },
          },
        },
      },
    },
  },
};
