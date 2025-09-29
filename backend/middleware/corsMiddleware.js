/**
 * @file corsMiddleware.js
 * @description  This middleware  handles the CORS policy, allowing only specified clients to access
 *
 * @module middleware
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import cors from "cors";

// Internal core modules
import config from "../config/envManager.js";

/**
 * Normalizes an origin string for consistent comparison.
 *
 * - Trims whitespace
 * - Removes trailing slashes
 * - Converts to lowercase
 *
 * @param {string|null|undefined} o - The origin string.
 * @returns {string|null} Normalized origin or null if invalid.
 *
 * @example
 * normalizeOrigin("https://Example.com///"); // "https://example.com"
 */
function normalizeOrigin(o) {
  if (!o) return null;
  let s = o.trim();
  s = s.replace(/\/+$/, "").toLowerCase();
  return s;
}

// Parse whitelist origins from environment variables
const raw = config.cors_whitelist
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Fallback: use frontend_client if whitelist is empty
if (config.frontend_client && !raw.length) {
  raw.push(config.frontend_client.trim());
}

// Final normalized whitelist set
const whitelist = new Set(raw.map(normalizeOrigin).filter(Boolean));

/**
 * CORS options delegate used by `cors` middleware.
 *
 * - Allows requests if origin is in the whitelist.
 * - Logs blocked requests to console.
 * - Always allows requests without an Origin header (e.g., curl).
 * - Enables credentials and standard HTTP methods.
 *
 * @param {import("express").Request} req - Express request.
 * @param {Function} cb - Callback to provide CORS config.
 */
const corsOptionsDelegate = (req, cb) => {
  const originHdr = req.header("Origin");
  let isAllowed = !originHdr;

  if (originHdr) {
    const norm = normalizeOrigin(originHdr);
    if (whitelist.has(norm)) {
      isAllowed = true;
    } else {
      console.warn(
        `[CORS BLOCKED] ${req.method} ${req.originalUrl} from Origin: ${originHdr}`,
      );
    }
  }

  cb(null, {
    origin: isAllowed ? originHdr : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // cache preflight for 1 day
  });
};

/**
 * CORS middleware configured with dynamic whitelist checking.
 *
 * Usage in Express:
 * @example
 * import corsMiddleware from "./middleware/cors.js";
 * app.use(corsMiddleware);
 */
export default cors(corsOptionsDelegate);

