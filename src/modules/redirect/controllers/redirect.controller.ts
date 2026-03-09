import { FastifyReply, FastifyRequest } from "fastify";

import { LinksRepository } from "../../links/repositories/links.repository";
import { ResolveLinkService } from "../services/resolve-link.service";

export async function redirectController(
  request: FastifyRequest<{ Params: { code: string } }>,
  reply: FastifyReply,
) {
  const linksRepository = new LinksRepository();
  const resolveLinkService = new ResolveLinkService(linksRepository);

  const result = await resolveLinkService.execute(request.params.code);

  return reply.redirect(result.longUrl);
}
