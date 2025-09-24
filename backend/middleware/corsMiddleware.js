import cors from "cors";
import logger from "../utility/logger.js";
import config from "../config/envManager.js";

function normalizeOrigin(o) {
  if (!o) return null;
  let s = o.trim();
  s = s.replace(/\/+$/, "").toLowerCase();
  return s;
}

const raw = config.cors_whitelist
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (config.frontend_client && !raw.length) {
  raw.push(config.frontend_client.trim());
}

const whitelist = new Set(raw.map(normalizeOrigin).filter(Boolean));
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
    maxAge: 86400,
  });
};

export default cors(corsOptionsDelegate);
