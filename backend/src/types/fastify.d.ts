import "fastify";
import type { UserPayload } from "../../models/token";

declare module "fastify" {
  interface FastifyRequest {
    user?: UserPayload;
    scope: any;
    resolve: <T>(key: string) => T;
    validatedFile?: MultipartFile;
  }
}
