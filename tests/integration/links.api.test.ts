import { describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";

describe("Links API", () => {
  it("should create a short link", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/v1/links",
      payload: {
        longUrl: "https://example.com",
      },
    });

    expect(response.statusCode).toBe(201);

    const body = JSON.parse(response.body);

    expect(body.code).toBeDefined();
    expect(body.longUrl).toBe("https://example.com");
    expect(body.shortUrl).toContain(body.code);
  });

  it("should redirect using short link", async () => {
    const app = buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/links",
      payload: {
        longUrl: "https://example.com",
      },
    });

    const body = JSON.parse(createResponse.body);

    const redirectResponse = await app.inject({
      method: "GET",
      url: `/${body.code}`,
    });

    expect(redirectResponse.statusCode).toBe(302);
    expect(redirectResponse.headers.location).toBe("https://example.com");
  });
});
