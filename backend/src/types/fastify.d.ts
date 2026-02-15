import "@fastify/csrf-protection";
import "fastify";

import type { UserPayload } from "../../models/token";

declare module "fastify" {
  interface FastifyRequest {
    user?: UserPayload;
    scope: any;
    resolve: <T>(key: string) => T;
    validatedFile?: MultipartFile;
    rateLimitIdentity?: string;
    override<T>(key: string, factory: (scope: ScopedContainer) => T): void;
  }
}
