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
import corsMiddleware from "./middleware/corsMiddleware.js";
import {
  generalRateLimiter,
  authRateLimiter,
} from "./middleware/rateLimiterMiddleware.js";
import requestLogger from "./middleware/httpLoggerMiddleware.js";
import { requestContext } from "./middleware/requestContext.js";

// Routes
import serverRoutes from "./route/route.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Core Middleware ----------
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ---------- Security & CORS ----------
app.set("trust proxy", 1); // Needed for secure cookies behind proxies
app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);

// ---------- Rate Limiting ----------
app.use(generalRateLimiter);

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
app.use("/api/auth", authRateLimiter);
app.use("/api", serverRoutes);

// ---------- Error Handler ----------
/**
 * Global error handler.
 *
 * @param {Error} err - The error object (with optional `statusCode`).
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Server failed to process the data";

  if (status === 500) {
    logger.error(`Server failed to process the data: ${err.message}`);
  }

  res.status(status).json({ error: message });
});

export default app;
