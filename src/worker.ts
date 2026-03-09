import "dotenv/config";

import { prisma } from "./infrastructure/database/prisma";
import { redis } from "./infrastructure/cache/redis";
import { analyticsWorker } from "./modules/analytics/workers/analytics.worker";

analyticsWorker.on("ready", () => {
  console.log("Analytics worker is ready");
});

analyticsWorker.on("completed", (job) => {
  console.log(`Processed analytics job ${job.id}`);
});

analyticsWorker.on("failed", (job, error) => {
  console.error(`Analytics job ${job?.id} failed`, error);
});

async function shutdown(signal: string) {
  console.log(`Shutdown signal received: ${signal}`);

  try {
    await analyticsWorker.close();
    console.log("Analytics worker closed");

    if (redis.status === "ready" || redis.status === "connect") {
      await redis.quit();
      console.log("Redis connection closed");
    }

    await prisma.$disconnect();
    console.log("Prisma disconnected");

    process.exit(0);
  } catch (error) {
    console.error("Error during worker graceful shutdown", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
