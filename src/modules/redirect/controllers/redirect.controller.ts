import { FastifyReply, FastifyRequest } from "fastify";

import { features } from "../../../common/config/features";
import { PublishClickEventService } from "../../analytics/services/publish-click-event.service";
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

  if (features.analyticsEnabled) {
    const publishClickEventService = new PublishClickEventService();

    void publishClickEventService.execute(result.code).catch((error) => {
      request.log.error(
        {
          error,
          code: result.code,
        },
        "Failed to publish click event",
      );
    });
  }

  request.log.info(
    {
      code: result.code,
      source: result.source,
    },
    "Resolved short link",
  );

  return reply.redirect(result.longUrl);
}
