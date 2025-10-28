import type { UserPayload } from "../../models/token";

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}
