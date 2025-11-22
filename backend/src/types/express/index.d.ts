import type container from "../../container";
import type { UserPayload } from "../../models/token";

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
      scope: ReturnType<typeof container.createScope>;
      resolve: <T>(key: string) => T;
    }
  }
}
