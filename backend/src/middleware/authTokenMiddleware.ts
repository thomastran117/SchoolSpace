/**
 * @file authTokenMiddleware.ts
 * @description
 * Express middleware that protects routes requiring an access token.
 * Adds the user payload to the request object for downstream access.
 *
 * @module middleware
 * @version 1.0.0
 * @author Thomas
 */

import { Request, Response, NextFunction } from "express";
import { getUserPayload } from "../service/tokenService";
/**
 * Express middleware that enforces authentication via JWT access token.
 *
 * - Extracts the `Authorization` header (`Bearer <token>`).
 * - Validates the token using `getUserPayload`.
 * - Attaches the decoded user payload to `req.user`.
 * - Returns `401 Unauthorized` if token is missing, invalid, or expired.
 *
 * @example
 * app.get("/protected", makeRequireAuth, (req, res) => {
 *   res.json({ message: `Hello, ${req.user.id}` });
 * });
 */
export async function makeRequireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>  {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Missing Authorization header" });
      return;
    }

    req.user = await getUserPayload(authHeader);
    next();
  } catch (e: any) {
    res
      .status(e.statusCode || 401)
      .json({ error: e.message || "Unauthorized" });
    return;
  }
}
