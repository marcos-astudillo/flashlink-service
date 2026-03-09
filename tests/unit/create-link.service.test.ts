import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateLinkService } from "../../src/modules/links/services/create-link.service";
import { features } from "../../src/common/config/features";

describe("CreateLinkService", () => {
  const linksRepository = {
    create: vi.fn(),
    findByCode: vi.fn(),
    findReusableByLongUrl: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    features.dedupeEnabled = false;
  });

  it("should create a new short link when dedupe is disabled", async () => {
    linksRepository.findByCode.mockResolvedValue(null);
    linksRepository.create.mockResolvedValue({
      code: "abc1234",
      longUrl: "https://example.com",
      createdAt: new Date("2026-03-09T00:00:00.000Z"),
      expiresAt: null,
    });

    const service = new CreateLinkService(linksRepository as never);

    const result = await service.execute({
      longUrl: "https://example.com",
    });

    expect(linksRepository.findByCode).toHaveBeenCalled();
    expect(linksRepository.create).toHaveBeenCalledWith({
      code: expect.any(String),
      longUrl: "https://example.com",
      expiresAt: undefined,
    });

    expect(result).toEqual({
      code: "abc1234",
      longUrl: "https://example.com",
      shortUrl: "http://localhost:3000/abc1234",
      createdAt: "2026-03-09T00:00:00.000Z",
      expiresAt: null,
    });
  });

  it("should reuse an existing short link when dedupe is enabled and link is not expired", async () => {
    features.dedupeEnabled = true;

    linksRepository.findReusableByLongUrl.mockResolvedValue({
      code: "reuse123",
      longUrl: "https://example.com",
      createdAt: new Date("2026-03-09T00:00:00.000Z"),
      expiresAt: null,
    });

    const service = new CreateLinkService(linksRepository as never);

    const result = await service.execute({
      longUrl: "https://example.com",
    });

    expect(linksRepository.findReusableByLongUrl).toHaveBeenCalledWith(
      "https://example.com",
    );
    expect(linksRepository.create).not.toHaveBeenCalled();

    expect(result).toEqual({
      code: "reuse123",
      longUrl: "https://example.com",
      shortUrl: "http://localhost:3000/reuse123",
      createdAt: "2026-03-09T00:00:00.000Z",
      expiresAt: null,
    });
  });

  it("should create a new short link when dedupe is enabled but existing link is expired", async () => {
    features.dedupeEnabled = true;

    linksRepository.findReusableByLongUrl.mockResolvedValue({
      code: "old1234",
      longUrl: "https://example.com",
      createdAt: new Date("2026-03-09T00:00:00.000Z"),
      expiresAt: new Date("2020-01-01T00:00:00.000Z"),
    });

    linksRepository.findByCode.mockResolvedValue(null);
    linksRepository.create.mockResolvedValue({
      code: "new1234",
      longUrl: "https://example.com",
      createdAt: new Date("2026-03-09T00:00:00.000Z"),
      expiresAt: null,
    });

    const service = new CreateLinkService(linksRepository as never);

    const result = await service.execute({
      longUrl: "https://example.com",
    });

    expect(linksRepository.create).toHaveBeenCalled();

    expect(result).toEqual({
      code: "new1234",
      longUrl: "https://example.com",
      shortUrl: "http://localhost:3000/new1234",
      createdAt: "2026-03-09T00:00:00.000Z",
      expiresAt: null,
    });
  });

  it("should retry code generation when generated code already exists", async () => {
    linksRepository.findByCode
      .mockResolvedValueOnce({ code: "collision" })
      .mockResolvedValueOnce(null);

    linksRepository.create.mockResolvedValue({
      code: "final123",
      longUrl: "https://example.com",
      createdAt: new Date("2026-03-09T00:00:00.000Z"),
      expiresAt: null,
    });

    const service = new CreateLinkService(linksRepository as never);

    const result = await service.execute({
      longUrl: "https://example.com",
    });

    expect(linksRepository.findByCode).toHaveBeenCalledTimes(2);
    expect(linksRepository.create).toHaveBeenCalled();

    expect(result.code).toBe("final123");
  });
});
