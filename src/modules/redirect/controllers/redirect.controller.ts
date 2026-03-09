import { FastifyReply, FastifyRequest } from "fastify";

import { LinksRepository } from "../../links/repositories/links.repository";
import { RedirectCacheRepository } from "../repositories/redirect-cache.repository";
import { ResolveLinkService } from "../services/resolve-link.service";

export async function redirectController(
  request: FastifyRequest<{ Params: { code: string } }>,
  reply: FastifyReply,
) {
  const linksRepository = new LinksRepository();
  const redirectCacheRepository = new RedirectCacheRepository();
  const resolveLinkService = new ResolveLinkService(
    linksRepository,
    redirectCacheRepository,
  );

  const result = await resolveLinkService.execute(request.params.code);

  request.log.info(
    {
      code: result.code,
      source: result.source,
    },
    "Resolved short link",
  );

  return reply.redirect(result.longUrl);
}
