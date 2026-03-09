import { env } from "../../common/config/env";

function parseRedisUrl(redisUrl: string) {
  const url = new URL(redisUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
  };
}

export const redisConnection = parseRedisUrl(env.REDIS_URL);
