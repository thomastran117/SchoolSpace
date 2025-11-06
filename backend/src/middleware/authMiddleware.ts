import { Request, Response, NextFunction } from "express";
import { getRouteMetadata } from "../metadata/registry";
import container from "../resource/container";

export async function AuthMetadataGuard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const routeHandler = req.route?.stack?.slice(-1)[0]?.handle;
  if (!routeHandler) return next();

  const { requireAuth, roles = [] } = getRouteMetadata(routeHandler);
  const basicTokenService = container.basicTokenService;

  try {
    if (requireAuth) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = basicTokenService.getUserPayload(authHeader);
      (req as any).user = user;

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient role" });
      }
    }

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
