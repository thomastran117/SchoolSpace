import { Request, Response, NextFunction } from "express";
import { META_REQUIRE_AUTH, META_ROLES } from "../constants/metadata";
import container from "../resource/container";
import "reflect-metadata";

export async function AuthMetadataGuard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const routeHandler = req.route?.stack?.slice(-1)[0]?.handle;
  if (!routeHandler) return next();

  const requireAuth = Reflect.getMetadata(META_REQUIRE_AUTH, routeHandler);
  const requiredRoles: string[] =
    Reflect.getMetadata(META_ROLES, routeHandler) || [];

  const basicTokenService = container.basicTokenService;

  try {
    if (requireAuth) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = basicTokenService.getUserPayload(authHeader);
      (req as any).user = user;

      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient role" });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
