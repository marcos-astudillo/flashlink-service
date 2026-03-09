import { checkDatabase, checkRedis } from "./health.service";

export async function healthController() {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);

  const status = database === "up" && redis === "up" ? "ok" : "degraded";

  return {
    status,
    service: "flashlink-service",
    checks: {
      database,
      redis,
    },
  };
}
