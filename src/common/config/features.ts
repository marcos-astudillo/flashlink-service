import { env } from "./env";

export const features = {
  analyticsEnabled: env.FEATURE_ANALYTICS,
  linkExpirationEnabled: env.FEATURE_LINK_EXPIRATION,
  dedupeEnabled: env.FEATURE_DEDUPE,
  rateLimitEnabled: env.RATE_LIMIT_ENABLED,
};
