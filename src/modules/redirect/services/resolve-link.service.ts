import { HttpError } from "../../../common/errors/http-error";
import { LinksRepository } from "../../links/repositories/links.repository";

export class ResolveLinkService {
  constructor(private readonly linksRepository: LinksRepository) {}

  async execute(code: string) {
    const link = await this.linksRepository.findByCode(code);

    if (!link) {
      throw new HttpError(404, "Short link not found");
    }

    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
      throw new HttpError(410, "Short link has expired");
    }

    return {
      code: link.code,
      longUrl: link.longUrl,
    };
  }
}
