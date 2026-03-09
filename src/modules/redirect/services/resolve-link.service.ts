import { HttpError } from "../../../common/errors/http-error";
import { LinksRepository } from "../../links/repositories/links.repository";
import { RedirectCacheRepository } from "../repositories/redirect-cache.repository";

export class ResolveLinkService {
  constructor(
    private readonly linksRepository: LinksRepository,
    private readonly redirectCacheRepository: RedirectCacheRepository,
  ) {}

  async execute(code: string) {
    const cachedLink = await this.redirectCacheRepository.get(code);

    if (cachedLink) {
      if (
        cachedLink.expiresAt &&
        new Date(cachedLink.expiresAt).getTime() <= Date.now()
      ) {
        throw new HttpError(410, "Short link has expired");
      }

      return {
        code: cachedLink.code,
        longUrl: cachedLink.longUrl,
        source: "cache",
      };
    }

    const link = await this.linksRepository.findByCode(code);

    if (!link) {
      throw new HttpError(404, "Short link not found");
    }

    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
      throw new HttpError(410, "Short link has expired");
    }

    await this.redirectCacheRepository.set({
      code: link.code,
      longUrl: link.longUrl,
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
    });

    return {
      code: link.code,
      longUrl: link.longUrl,
      source: "database",
    };
  }
}
