import type { Request, Response, NextFunction } from "express";
import container from "../resource/container";

export function AuthGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const tokenService = container.basicTokenService;

    const user = tokenService.getUserPayload(token);
    (req as any).user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
