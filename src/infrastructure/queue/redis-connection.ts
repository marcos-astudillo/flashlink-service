import { env } from "../../common/config/env";

function parseRedisUrl(redisUrl: string) {
  const url = new URL(redisUrl);

  const username = url.username ? decodeURIComponent(url.username) : undefined;
  const password = url.password ? decodeURIComponent(url.password) : undefined;
  const db =
    url.pathname && url.pathname !== "/"
      ? Number(url.pathname.slice(1))
      : undefined;

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username,
    password,
    db,
    tls: url.protocol === "rediss:" ? {} : undefined,
  };
}

export const redisConnection = parseRedisUrl(env.REDIS_URL);
