export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3000),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",
};
