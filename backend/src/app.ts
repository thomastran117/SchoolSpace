/**
 * @file app.ts
 * @description
 * Express application setup.
 *
 * - Configures JSON parsing, cookies, static files.
 * - Applies CORS, rate limiting, and logging middleware.
 * - Serves frontend static assets and API routes.
 * - Handles errors with structured JSON responses.
 *
 * @module app
 *
 * @author Thomas
 * @version 1.0.0
 */

import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import path from "path";

// Utilities
import logger from "./utility/logger";

// Middleware
import {
  generalRateLimiter,
  authRateLimiter,
} from "./middleware/rateLimiterMiddleware";
import requestLogger from "./middleware/httpLoggerMiddleware";
import { errorHandler } from "./middleware/errorHandlerMiddleware";
import { securityMiddlewareBundle } from "./middleware/securityMiddleware";

// Routes
import serverRoutes from "./route/route";

const app: Application = express();

// ---------- Core Middleware ----------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ---------- Security ----------
app.use(securityMiddlewareBundle());

// ---------- Rate Limiting ----------
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

// ---------- Logging ----------
app.use(requestLogger);

// ---------- Routes ----------
/**
 * Root route serving static frontend.
 */
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Healthcheck route for API status.
 */
app.get("/api", (_req: Request, res: Response) => {
  res.send("API is running!");
});

// ---------- API Routes ----------
app.use("/api", serverRoutes);

// ---------- Error Handling ----------
app.use(errorHandler);

export default app;
