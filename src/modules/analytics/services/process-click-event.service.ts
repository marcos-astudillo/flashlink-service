import { ClickEventDailyRepository } from "../repositories/click-event-daily.repository";

export class ProcessClickEventService {
  constructor(
    private readonly clickEventDailyRepository: ClickEventDailyRepository,
  ) {}

  async execute(code: string, clickedAt: string): Promise<void> {
    const clickDate = new Date(clickedAt);

    const dayBucket = new Date(
      Date.UTC(
        clickDate.getUTCFullYear(),
        clickDate.getUTCMonth(),
        clickDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    await this.clickEventDailyRepository.incrementDailyClicks(code, dayBucket);
  }
}
