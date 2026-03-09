import { Queue } from "bullmq";

import { redisConnection } from "../../../infrastructure/queue/redis-connection";
import type { ClickEventJobData } from "../types/click-event.type";

export const ANALYTICS_CLICKS_QUEUE = "analytics-clicks";

export const analyticsQueue = new Queue<ClickEventJobData>(
  ANALYTICS_CLICKS_QUEUE,
  {
    connection: redisConnection,
  },
);
