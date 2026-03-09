function toBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
}

function toNumber(value: string | undefined, defaultValue: number): number {
  if (!value) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return defaultValue;
  }

  return parsedValue;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: toNumber(process.env.PORT, 3000),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/flashlink",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  REDIRECT_CACHE_TTL_SECONDS: toNumber(
    process.env.REDIRECT_CACHE_TTL_SECONDS,
    3600,
  ),
  FEATURE_ANALYTICS: toBoolean(process.env.FEATURE_ANALYTICS, true),
  FEATURE_LINK_EXPIRATION: toBoolean(process.env.FEATURE_LINK_EXPIRATION, true),
  FEATURE_DEDUPE: toBoolean(process.env.FEATURE_DEDUPE, false),
  RATE_LIMIT_ENABLED: toBoolean(process.env.RATE_LIMIT_ENABLED, true),
  RATE_LIMIT_MAX: toNumber(process.env.RATE_LIMIT_MAX, 100),
  RATE_LIMIT_WINDOW_MINUTES: toNumber(process.env.RATE_LIMIT_WINDOW_MINUTES, 1),
  CREATE_LINK_RATE_LIMIT_MAX: toNumber(
    process.env.CREATE_LINK_RATE_LIMIT_MAX,
    20,
  ),
  REDIRECT_RATE_LIMIT_MAX: toNumber(process.env.REDIRECT_RATE_LIMIT_MAX, 300),
} as const;
