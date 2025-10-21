/**
 * @file securityMiddleware.js
 * @description Comprehensive security middleware for Express apps.
 * Provides CORS, Helmet headers, HPP, XSS sanitization, CSRF protection,
 * and Mongo injection sanitization.
 *
 * @version 1.2.0
 * @author Thomas
 */

// External libraries
import cors from "cors";
import sanitizeHtml from "sanitize-html";
import hpp from "hpp";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import csurf from "csurf";

// Internal modules
import config from "../config/envManager.js";
import logger from "../utility/logger.js";

/* -------------------------------------------------------------
 * Origin Normalization Helper
 * ----------------------------------------------------------- */
function normalizeOrigin(o) {
  if (!o) return null;
  return o.trim().replace(/\/+$/, "").toLowerCase();
}

/* -------------------------------------------------------------
 * Parse CORS whitelist
 * ----------------------------------------------------------- */
const raw =
  config.cors_whitelist
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) || [];

if (config.frontend_client && !raw.length) {
  raw.push(config.frontend_client.trim());
}

const whitelist = new Set(raw.map(normalizeOrigin).filter(Boolean));

/* -------------------------------------------------------------
 * CORS Middleware
 * ----------------------------------------------------------- */
const corsOptionsDelegate = (req, cb) => {
  const originHdr = req.header("Origin");
  let isAllowed = !originHdr; // allow curl/Postman (no Origin)

  if (originHdr) {
    const norm = normalizeOrigin(originHdr);
    if (whitelist.has(norm)) {
      isAllowed = true;
    } else if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[CORS BLOCKED] ${req.method} ${req.originalUrl} from Origin: ${originHdr}`,
      );
    }
  }

  cb(null, {
    origin: isAllowed ? originHdr : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });
};

const corsMiddleware = cors(corsOptionsDelegate);

/* -------------------------------------------------------------
 * Helmet: Secure HTTP Headers
 * ----------------------------------------------------------- */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:", "https:"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "no-referrer" },
  frameguard: { action: "deny" },
});

/* -------------------------------------------------------------
 * HPP Protection
 * ----------------------------------------------------------- */
const preventHpp = hpp({
  whitelist: ["tags", "categories", "filters"],
});

/* -------------------------------------------------------------
 * Mongo / NoSQL Injection Sanitization
 * ----------------------------------------------------------- */
const preventNoSqlInjection = (req, res, next) => {
  try {
    mongoSanitize.sanitize(req.body, { replaceWith: "_" });
    mongoSanitize.sanitize(req.query, { replaceWith: "_" });
    mongoSanitize.sanitize(req.params, { replaceWith: "_" });
  } catch (err) {
    console.warn("[MongoSanitize] Warning:", err.message);
  }
  next();
};

/* -------------------------------------------------------------
 * XSS and Input Sanitization
 * ----------------------------------------------------------- */
const sanitizeInput = (req, _res, next) => {
  const clean = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "string") {
        obj[key] = sanitizeHtml(val, {
          allowedTags: [],
          allowedAttributes: {},
        });
      } else if (typeof val === "object") {
        clean(val);
      }
    }
    return obj;
  };

  if (req.body) clean(req.body);
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);

  next();
};

/* -------------------------------------------------------------
 * CSRF Protection (with safe dev fallback)
 * ----------------------------------------------------------- */
let csrfProtection;
if (process.env.NODE_ENV === "production") {
  csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    },
  });
  logger.info("[CSRF] Protection enabled (production mode)");
} else {
  csrfProtection = (_req, _res, next) => next();
  logger.warn("[CSRF] Skipped for development");
}

/* -------------------------------------------------------------
 * Aggregated Middleware Bundle
 * ----------------------------------------------------------- */
const securityMiddlewareBundle = () => [
  corsMiddleware,
  securityHeaders,
  preventHpp,
  preventNoSqlInjection,
  sanitizeInput,
  csrfProtection,
];

export {
  sanitizeInput,
  corsMiddleware,
  preventHpp,
  securityHeaders,
  preventNoSqlInjection,
  csrfProtection,
  securityMiddlewareBundle,
};
