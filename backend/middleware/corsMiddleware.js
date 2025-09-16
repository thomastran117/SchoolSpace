// middleware/corsMiddleware.js
const cors = require("cors");

function normalizeOrigin(o) {
  if (!o) return null;
  let s = o.trim();
  if (!/^https?:\/\//i.test(s)) s = `http://${s}`; // assume http if scheme missing (dev)
  return s.replace(/\/+$/, "");
}

const raw = (process.env.CORS_WHITELIST || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (process.env.FRONTEND_CLIENT && !raw.length) {
  raw.push(process.env.FRONTEND_CLIENT.trim());
}

const whitelist = new Set(raw.map(normalizeOrigin).filter(Boolean));
console.log(whitelist);

const corsOptionsDelegate = (req, cb) => {
  const originHdr = req.header("Origin");
  let isAllowed = !originHdr; // allow non-browser clients (no Origin)

  if (originHdr) {
    const norm = normalizeOrigin(originHdr);
    isAllowed = whitelist.has(norm);
    if (!isAllowed) {
      console.warn(`[CORS BLOCKED] ${req.method} ${req.originalUrl} from Origin: ${originHdr}`);
    }
  }

  cb(null, {
    origin: isAllowed ? originHdr : false,
    credentials: true, // if you send cookies/Authorization from the browser
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // Do NOT expose Set-Cookie; browsers disallow it
    maxAge: 86400,
    // You can add: optionsSuccessStatus: 204,
  });
};

module.exports = cors(corsOptionsDelegate);
