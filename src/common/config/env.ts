export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3000),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/flashlink",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  REDIRECT_CACHE_TTL_SECONDS: Number(
    process.env.REDIRECT_CACHE_TTL_SECONDS || 3600,
  ),
};
