export const createLinkSchema = {
  body: {
    type: "object",
    required: ["longUrl"],
    additionalProperties: false,
    properties: {
      longUrl: { type: "string", format: "uri", maxLength: 2048 },
      expiresAt: { type: "string", format: "date-time" },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        code: { type: "string" },
        longUrl: { type: "string" },
        shortUrl: { type: "string" },
        createdAt: { type: "string" },
        expiresAt: {
          anyOf: [{ type: "string" }, { type: "null" }],
        },
      },
    },
  },
};
