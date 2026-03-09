import { prisma } from "../infrastructure/database/prisma";
import { redis } from "../infrastructure/cache/redis";

export async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "up";
  } catch {
    return "down";
  }
}

export async function checkRedis() {
  try {
    await redis.ping();
    return "up";
  } catch {
    return "down";
  }
}
