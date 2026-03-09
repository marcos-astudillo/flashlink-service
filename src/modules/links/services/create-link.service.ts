import { env } from "../../../common/config/env";
import { features } from "../../../common/config/features";
import { generateShortCode } from "../../../common/utils/generate-short-code";
import { LinksRepository } from "../repositories/links.repository";
import type {
  CreateLinkInput,
  CreateLinkResult,
} from "../types/create-link.types";

export class CreateLinkService {
  constructor(private readonly linksRepository: LinksRepository) {}

  async execute(input: CreateLinkInput): Promise<CreateLinkResult> {
    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : undefined;

    if (features.dedupeEnabled) {
      const existingLink = await this.linksRepository.findReusableByLongUrl(
        input.longUrl,
      );

      if (existingLink) {
        const isExpired =
          existingLink.expiresAt !== null &&
          existingLink.expiresAt.getTime() <= Date.now();

        if (!isExpired) {
          return {
            code: existingLink.code,
            longUrl: existingLink.longUrl,
            shortUrl: `${env.BASE_URL}/${existingLink.code}`,
            createdAt: existingLink.createdAt.toISOString(),
            expiresAt: existingLink.expiresAt
              ? existingLink.expiresAt.toISOString()
              : null,
          };
        }
      }
    }

    let code = generateShortCode();
    let existingCode = await this.linksRepository.findByCode(code);

    while (existingCode) {
      code = generateShortCode();
      existingCode = await this.linksRepository.findByCode(code);
    }

    const createdLink = await this.linksRepository.create({
      code,
      longUrl: input.longUrl,
      expiresAt,
    });

    return {
      code: createdLink.code,
      longUrl: createdLink.longUrl,
      shortUrl: `${env.BASE_URL}/${createdLink.code}`,
      createdAt: createdLink.createdAt.toISOString(),
      expiresAt: createdLink.expiresAt
        ? createdLink.expiresAt.toISOString()
        : null,
    };
  }
}
