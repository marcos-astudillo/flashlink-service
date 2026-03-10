import "dotenv/config";

import { buildApp } from "./app";
import { env } from "./common/config/env";
import { prisma } from "./infrastructure/database/prisma";
import { redis } from "./infrastructure/cache/redis";

let app: Awaited<ReturnType<typeof buildApp>>;

async function shutdown(signal: string) {
  if (!app) {
    process.exit(0);
  }

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
    app = await buildApp();
    console.log(app.printRoutes());

    await redis.connect();
    app.log.info("Redis connected");

    console.log(app.printRoutes());

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    app.log.info(`Server running on port ${env.PORT}`);
  } catch (error) {
    if (app) {
      app.log.error(error, "Failed to start server");
    } else {
      console.error("Failed to start server", error);
    }

    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void start();
