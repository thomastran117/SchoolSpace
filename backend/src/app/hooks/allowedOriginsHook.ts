import type { FastifyReply, FastifyRequest } from "fastify";

const ALLOWED_ORIGINS = new Set(["http://localhost:3040"]);

export function assertAllowedOrigin(req: FastifyRequest, reply: FastifyReply) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (origin) {
    if (!ALLOWED_ORIGINS.has(origin)) {
      reply.code(403).send({ error: "Invalid origin" });
      return false;
    }
    return true;
  }

  if (referer) {
    const ok = Array.from(ALLOWED_ORIGINS).some((o) => referer.startsWith(o));
    if (!ok) {
      reply.code(403).send({ error: "Invalid referer" });
      return false;
    }
    return true;
  }

  reply.code(403).send({ error: "Missing origin" });
  return false;
}
