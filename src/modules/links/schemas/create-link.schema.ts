export const createLinkSchema = {
  tags: ["Links"],
  summary: "Create a short link",
  description:
    "Creates a short URL for a given long URL, with optional expiration date.",
  body: {
    type: "object",
    required: ["longUrl"],
    additionalProperties: false,
    properties: {
      longUrl: {
        type: "string",
        format: "uri",
        maxLength: 2048,
        description: "Original URL to shorten",
        default: "https://www.google.com",
      },
      expiresAt: {
        type: "string",
        format: "date-time",
        description: "Optional expiration timestamp in ISO 8601 format",
        default: "2026-12-31T00:00:00.000Z",
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Generated short code",
        },
        longUrl: {
          type: "string",
          description: "Original long URL",
        },
        shortUrl: {
          type: "string",
          description: "Public short URL",
        },
        createdAt: {
          type: "string",
          description: "Creation timestamp",
        },
        expiresAt: {
          anyOf: [{ type: "string" }, { type: "null" }],
        },
      },
    },
  },
};
