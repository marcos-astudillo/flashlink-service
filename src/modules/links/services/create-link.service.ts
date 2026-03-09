import { generateShortCode } from "../../../common/utils/generate-short-code";
import { env } from "../../../common/config/env";
import { LinksRepository } from "../repositories/links.repository";
import type {
  CreateLinkInput,
  CreateLinkResult,
} from "../types/create-link.types";

export class CreateLinkService {
  constructor(private readonly linksRepository: LinksRepository) {}

  async execute(input: CreateLinkInput): Promise<CreateLinkResult> {
    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : undefined;

    let code = generateShortCode();
    let existingLink = await this.linksRepository.findByCode(code);

    while (existingLink) {
      code = generateShortCode();
      existingLink = await this.linksRepository.findByCode(code);
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
