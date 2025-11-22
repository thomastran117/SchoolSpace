import type { UserPayload } from "../../models/token";
import type container from "../../container";

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
      scope: ReturnType<typeof container.createScope>;
      resolve: <T>(key: string) => T;
    }
  }
}
