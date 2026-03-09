import "dotenv/config";

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
