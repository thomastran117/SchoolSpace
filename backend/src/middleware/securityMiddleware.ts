/**
 * @file securityMiddleware.ts
 * @description
 * Comprehensive security middleware for Express apps.
 * Provides CORS, Helmet headers, HPP, XSS sanitization,
 * CSRF protection, and Mongo injection sanitization.
 *
 * @version 1.2.0
 * @auth Thomas
 */

import type { CorsOptionsDelegate } from "cors";
import cors from "cors";
import sanitizeHtml from "sanitize-html";
import hpp from "hpp";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import type { CookieOptions } from "csurf";
import csurf from "csurf";
import type { Request, Response, NextFunction } from "express";

import env from "../config/envConfigs";
import logger from "../utility/logger";

function normalizeOrigin(o: string | null | undefined): string | null {
  if (!o) return null;
  return o.trim().replace(/\/+$/, "").toLowerCase();
}

const raw =
  env.cors_whitelist
    ?.split(",")
    .map((s: string) => s.trim())
    .filter(Boolean) || [];

if (env.frontend_client && !raw.length) {
  raw.push(env.frontend_client.trim());
}

const whitelist = new Set(raw.map(normalizeOrigin).filter(Boolean) as string[]);

const corsOptionsDelegate: CorsOptionsDelegate<Request> = (req, cb) => {
  const originHdr = req.header("Origin");
  let isAllowed = !originHdr;

  if (originHdr) {
    const norm = normalizeOrigin(originHdr);
    if (norm && whitelist.has(norm)) {
      isAllowed = true;
    } else if (process.env.NODE_ENV !== "production") {
      logger.warn(
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

const preventHpp = hpp({
  whitelist: ["tags", "categories", "filters"],
});

function preventNoSqlInjection(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    mongoSanitize.sanitize(req.body as Record<string, unknown>, {
      replaceWith: "_",
    });
    mongoSanitize.sanitize(req.query as Record<string, unknown>, {
      replaceWith: "_",
    });
    mongoSanitize.sanitize(req.params as Record<string, unknown>, {
      replaceWith: "_",
    });
  } catch (err) {
    if (err instanceof Error) {
      logger.warn(`[MongoSanitize] Warning: ${err.message}`);
    }
  }
  next();
}

function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  const clean = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map((v) => clean(v));
    }

    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const val = record[key];
      if (typeof val === "string") {
        record[key] = sanitizeHtml(val, {
          allowedTags: [],
          allowedAttributes: {},
        });
      } else if (typeof val === "object" && val !== null) {
        record[key] = clean(val);
      }
    }
    return record;
  };

  if (req.body) clean(req.body);
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);

  next();
}

let csrfProtection: (req: Request, res: Response, next: NextFunction) => void;

if (process.env.NODE_ENV === "production") {
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  };

  csrfProtection = csurf({ cookie: cookieOptions });
  logger.info("[CSRF] Protection enabled (production mode)");
} else {
  csrfProtection = (_req, _res, next) => next();
  logger.warn("[CSRF] Skipped for development");
}

function securityMiddlewareBundle(): Array<
  (req: Request, res: Response, next: NextFunction) => void
> {
  return [
    corsMiddleware,
    securityHeaders,
    preventHpp,
    preventNoSqlInjection,
    sanitizeInput,
    csrfProtection,
  ];
}

export {
  sanitizeInput,
  corsMiddleware,
  preventHpp,
  securityHeaders,
  preventNoSqlInjection,
  csrfProtection,
  securityMiddlewareBundle,
};
