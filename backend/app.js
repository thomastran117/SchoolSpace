/**
 * @file app.js
 * @description
 *  * Express application setup.
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
 *
 */

// Third party libaries
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Utilities
import logger from "./utility/logger.js";

// Middleware
import {
  generalRateLimiter,
  authRateLimiter,
} from "./middleware/rateLimiterMiddleware.js";
import requestLogger from "./middleware/httpLoggerMiddleware.js";
import { requestContext } from "./middleware/requestContext.js";
import { errorHandler } from "./middleware/errorHandlerMiddleware.js";
import {
  corsMiddleware,
  securityHeaders,
  preventHpp,
  sanitizeInput,
} from "./middleware/securityMiddleware.js";

// Routes
import serverRoutes from "./route/route.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Core Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ---------- Security  ----------
app.set("trust proxy", 1);
app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);
app.use(securityHeaders);
app.use(preventHpp);
app.use(sanitizeInput);

// ---------- Rate Limiting ----------
app.use(generalRateLimiter);
app.use(
  [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/verify",
    "api/auth/forgot-password",
    "api/auth/change-password",
    "api/auth/microsoft",
    "api/auth/google",
  ],
  authRateLimiter,
);

// ---------- Logging ----------
app.use(requestLogger);

// ---------- Context Middleware (if needed globally) ----------
// app.use(requestContext);

// ---------- Routes ----------
/**
 * Root route serving static frontend.
 */
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")),
);

/**
 * Healthcheck route for API status.
 */
app.get("/api", (_req, res) => res.send("API is running!"));

// Auth routes have stricter rate limiting
app.use("/api", serverRoutes);

app.use(errorHandler);

export default app;
