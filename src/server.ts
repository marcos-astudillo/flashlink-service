import "dotenv/config";

import { buildApp } from "./app";
import { env } from "./common/config/env";
import { prisma } from "./infrastructure/database/prisma";
import { redis } from "./infrastructure/cache/redis";

const app = buildApp();

async function shutdown(signal: string) {
  app.log.info({ signal }, "Shutdown signal received");

  try {
    await app.close();
    app.log.info("HTTP server closed");

    if (redis.status === "ready" || redis.status === "connect") {
      await redis.quit();
      app.log.info("Redis connection closed");
    }

    await prisma.$disconnect();
    app.log.info("Prisma disconnected");

    process.exit(0);
  } catch (error) {
    app.log.error({ error }, "Error during graceful shutdown");
    process.exit(1);
  }
}

async function start() {
  try {
    await redis.connect();
    app.log.info("Redis connected");

    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    app.log.info(`Server running on port ${env.PORT}`);
  } catch (error) {
    app.log.error(error, "Failed to start server");
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

start();
