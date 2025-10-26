import { Request, Response, NextFunction } from "express";
import { getUserPayload } from "../service/tokenService";
import config from "../config/envManager";

const API_KEY = config.schoolspace_api_key;

/**
 * Middleware to enforce API key and JWT authentication.
 *
 * - Verifies the custom API key header (`schoolspace-api-key` or `x-api-key`).
 * - Validates the Authorization header and decodes the user payload.
 * - Attaches `user` payload to `req` for downstream handlers.
 */
export async function requireApiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const apiKey =
      req.get("schoolspace-api-key") || req.get("x-api-key") || "";
    const authHeader = req.get("authorization");

    if (!apiKey || apiKey !== API_KEY) {
      return res.status(403).json({ error: "Forbidden: invalid API key" });
    }

    if (!authHeader) {
      return res.status(401).json({ error: "Missing JWT" });
    }

    req.user = await getUserPayload(authHeader);
    next();
  } catch (e: any) {
    return res
      .status(e.statusCode || 401)
      .json({ error: e.message || "Unauthorized" });
  }
}
