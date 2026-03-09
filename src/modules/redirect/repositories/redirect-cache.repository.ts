import { redis } from "../../../infrastructure/cache/redis";
import { env } from "../../../common/config/env";

interface CachedLink {
  code: string;
  longUrl: string;
  expiresAt: string | null;
}

export class RedirectCacheRepository {
  private buildKey(code: string) {
    return `redirect:${code}`;
  }

  async get(code: string): Promise<CachedLink | null> {
    const cachedValue = await redis.get(this.buildKey(code));

    if (!cachedValue) {
      return null;
    }

    return JSON.parse(cachedValue) as CachedLink;
  }

  async set(link: CachedLink): Promise<void> {
    await redis.set(
      this.buildKey(link.code),
      JSON.stringify(link),
      "EX",
      env.REDIRECT_CACHE_TTL_SECONDS,
    );
  }
}
