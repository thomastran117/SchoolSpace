import type { UserPayload } from "../../service/tokenService";

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}
