/**
 * @file authMiddleware.ts
 * @description
 * Inspects the HTTP request to ensure the User is authorized to access this route via
 * the attached JWT token. The middleware uses the container's BasicTokenService singleton
 * in order to inspect and validate the bearer token
 *
 * The middleware is attached in the route layer, not in app.ts
 *
 * Future changes may include attaching role guard later to keep the controller layer cleaner.
 *
 * @module middleware
 * @version 1.0.1
 * @author Thomas
 */

import type { NextFunction, Request, Response } from "express";
import container from "../container";
import type { BasicTokenService } from "../service/basicTokenService";

function AuthGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const tokenService = container.basicTokenService as BasicTokenService;
    const user = tokenService.getUserPayload(token);
    (req as any).user = user;

    next();
  } catch (err: any) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export { AuthGuard };
