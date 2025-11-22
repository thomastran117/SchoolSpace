/**
 * @file app.ts
 * @description
 * Express application setup.
 *
 * - Configures JSON parsing, cookies, static files.
 * - Applies CORS, rate limiting, and logging middleware.
 * - Waits for dependency container to initialize before app startup.
 *
 * @module app
 * @version 1.1.0
 * @author Thomas
 */

import cookieParser from "cookie-parser";
import type { Application, Request, Response } from "express";
import express from "express";
import path from "path";

// Utilities
import container from "./container";
import logger from "./utility/logger";

// Middleware
import { errorHandler } from "./middleware/errorHandlerMiddleware";
import requestLogger from "./middleware/httpLoggerMiddleware";
import { requestScopeMiddleware } from "./middleware/scopeMiddleware";
import { securityMiddlewareBundle } from "./middleware/securityMiddleware";
// Routes
import serverRoutes from "./route/route";

const app: Application = express();

/**
 * Initializes all singleton services before the app is used.
 * Ensures cache, email, and token services are ready.
 */
export async function initializeApp(): Promise<Application> {
  try {
    await container.initialize();
    // container.printDiagnostics();

    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true, limit: "1mb" }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, "public")));

    app.use(securityMiddlewareBundle());
    app.use(requestScopeMiddleware());

    /*
  app.use(generalRateLimiter);
  app.use(
    [
      "/api/auth/login",
      "/api/auth/signup",
      "/api/auth/verify",
      "/api/auth/forgot-password",
      "/api/auth/change-password",
      "/api/auth/microsoft",
      "/api/auth/google",
    ],
    authRateLimiter,
  );
  app.use(["/api/auth/refresh", "/api/files"], softRateLimiter);
  */
    app.use(requestLogger);

    app.get("/", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    app.get("/api", (_req: Request, res: Response) => {
      res.send("API is running!");
    });

    app.get("/ping", (_req: Request, res: Response) => {
      res.send("pong");
    });

    app.get("/api/health", (_req: Request, res: Response) => {
      res.send("Health check is good");
    });

    app.use("/api", serverRoutes);

    app.use(errorHandler);

    return app;
  } catch (err: any) {
    logger.error(
      `[Server] Application failed to start: ${err?.message ?? err}`,
    );
    process.exit(1);
  }
}

export default app;
