import { prisma } from "../../../infrastructure/database/prisma";

export class ClickEventDailyRepository {
  async incrementDailyClicks(code: string, date: Date) {
    return prisma.clickEventDaily.upsert({
      where: {
        code_date: {
          code,
          date,
        },
      },
      create: {
        code,
        date,
        clicks: 1,
      },
      update: {
        clicks: {
          increment: 1,
        },
      },
    });
  }
}
