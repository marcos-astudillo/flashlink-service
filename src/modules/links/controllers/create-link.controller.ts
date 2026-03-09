import { FastifyReply, FastifyRequest } from "fastify";

import { LinksRepository } from "../repositories/links.repository";
import { CreateLinkService } from "../services/create-link.service";
import type { CreateLinkInput } from "../types/create-link.types";

export async function createLinkController(
  request: FastifyRequest<{ Body: CreateLinkInput }>,
  reply: FastifyReply,
) {
  const linksRepository = new LinksRepository();
  const createLinkService = new CreateLinkService(linksRepository);

  const result = await createLinkService.execute(request.body);

  return reply.status(201).send(result);
}
