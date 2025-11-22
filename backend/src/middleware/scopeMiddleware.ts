import type { Request, Response, NextFunction } from "express";
import container from "../container";
import logger from "../utility/logger";

function requestScopeMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const scope = container.createScope();
    req.scope = scope;
    req.resolve = (key) => scope.resolve(key);

    try {
      await next();
    } catch (err) {
      next(err);
    } finally {
      try {
        scope.dispose();
      } catch (disposeErr) {
        logger.error(`[Scope] Failed disposing: ${disposeErr}`);
      }
    }
  };
}

export { requestScopeMiddleware };