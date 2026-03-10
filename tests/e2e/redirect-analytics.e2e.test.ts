import { describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/infrastructure/database/prisma";

describe("Redirect Analytics E2E", () => {
  it("should create link, redirect, and persist analytics event", async () => {
    const app = await buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/links",
      payload: {
        longUrl: "https://example.com/e2e",
      },
    });

    expect(createResponse.statusCode).toBe(201);

    const createBody = JSON.parse(createResponse.body);
    const code = createBody.code;

    const redirectResponse = await app.inject({
      method: "GET",
      url: `/${code}`,
    });

    expect(redirectResponse.statusCode).toBe(302);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const analyticsEvents = await prisma.clickEventDaily.findMany({
      where: { code },
    });

    expect(analyticsEvents.length).toBeGreaterThan(0);
    expect(analyticsEvents[0]?.clicks).toBeGreaterThan(0);
  });
});
