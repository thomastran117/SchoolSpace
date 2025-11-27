/**
 * @file scopeMiddleware.ts
 * @description
 * Creates the scope needed to handle object Lifetime for the HTTP request, and
 * disposes it after use.
 *
 * Since the application uses the custom IoC, this middleware is mandatory to have - otherwise
 * the container can not resolve dependencies correctly
 *
 * @module middleware
 * @version 1.0.0
 * @author Thomas
 */

import type { NextFunction, Request, Response } from "express";
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
