import "dotenv/config";

import { buildApp } from "./app";
import { env } from "./common/config/env";
import { redis } from "./infrastructure/cache/redis";

async function start() {
  const app = buildApp();

  try {
    await redis.connect();
    app.log.info("Redis connected");

    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    app.log.info(`Server running on port ${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
