import { analyticsQueue } from "../queues/analytics.queue";

export class PublishClickEventService {
  async execute(code: string): Promise<void> {
    await analyticsQueue.add(
      "track-click",
      {
        code,
        clickedAt: new Date().toISOString(),
      },
      {
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );
  }
}
