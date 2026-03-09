import { prisma } from "../../../infrastructure/database/prisma";

interface CreateLinkRecordInput {
  code: string;
  longUrl: string;
  expiresAt?: Date;
}

export class LinksRepository {
  async create(data: CreateLinkRecordInput) {
    return prisma.link.create({
      data: {
        code: data.code,
        longUrl: data.longUrl,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.link.findUnique({
      where: { code },
    });
  }

  async findReusableByLongUrl(longUrl: string) {
    return prisma.link.findFirst({
      where: {
        longUrl,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
