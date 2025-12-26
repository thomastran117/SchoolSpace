import jwt from "jsonwebtoken";

import env from "../config/envConfigs";
import { HttpError, httpError } from "../utility/httpUtility";
import logger from "../utility/logger";

const { jwtSecretAccess: JWT_SECRET_ACCESS } = env;

class BasicTokenService {
  /**
   * Decodes + validates an access token.
   */
  public validateAccessToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET_ACCESS) as {
        userId: number;
        username: string;
        role: string;
        avatar?: string;
      };
    } catch (err: any) {
      if (err.name === "TokenExpiredError")
        httpError(401, "Expired access token");
      if (err.name === "JsonWebTokenError")
        httpError(401, "Invalid access token");

      logger.error(
        `[BasicTokenService] validateAccessToken failed: ${err?.message ?? err}`
      );
      httpError(500, "Internal server error");
    }
  }

  /**
   * Extract user info from access token
   */
  public getUserPayload(token: string) {
    try {
      const decoded = this.validateAccessToken(token);
      return {
        id: decoded.userId,
        role: decoded.role,
        email: decoded.username,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[BasicTokenService] getUserPayload failed: ${err?.message ?? err}`
      );
      httpError(500, "Internal server error");
    }
  }

  public decodeUserId(token: string): string | null {
    try {
      const payload: any = jwt.decode(token);
      return payload?.userId?.toString() ?? null;
    } catch {
      return null;
    }
  }
}

export { BasicTokenService };
