import { Worker } from "bullmq";

import { redisConnection } from "../../../infrastructure/queue/redis-connection";
import { ANALYTICS_CLICKS_QUEUE } from "../queues/analytics.queue";
import { ClickEventDailyRepository } from "../repositories/click-event-daily.repository";
import { ProcessClickEventService } from "../services/process-click-event.service";
import type { ClickEventJobData } from "../types/click-event.type";

const clickEventDailyRepository = new ClickEventDailyRepository();
const processClickEventService = new ProcessClickEventService(
  clickEventDailyRepository,
);

export const analyticsWorker = new Worker<ClickEventJobData>(
  ANALYTICS_CLICKS_QUEUE,
  async (job) => {
    await processClickEventService.execute(job.data.code, job.data.clickedAt);
  },
  {
    connection: redisConnection,
  },
);
