const cors = require("cors");

const whitelist = (process.env.CORS_WHITELIST || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (process.env.FRONTEND_CLIENT && !whitelist.length) {
  whitelist.push(process.env.FRONTEND_CLIENT.trim());
}

const corsOptionsDelegate = (req, callback) => {
  const origin = req.header("Origin");
  const isAllowed = !origin || whitelist.includes(origin);

  const options = {
    origin: isAllowed,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
    maxAge: 86400,
  };

  callback(null, options);
};

module.exports = cors(corsOptionsDelegate);
