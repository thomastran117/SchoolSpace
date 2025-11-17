import type { NextFunction, Request, Response } from "express";
import container from "../container";
import type { BasicTokenService } from "../service/tokenService";
export function AuthGuard(req: Request, res: Response, next: NextFunction) {
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
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
