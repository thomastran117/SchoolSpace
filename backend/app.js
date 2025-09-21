const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config();

const corsMiddleware = require("./middleware/corsMiddleware");
const {
  generalRateLimiter,
  authRateLimiter,
} = require("./middleware/rateLimiterMiddleware");
const requestLogger = require("./middleware/httpLoggerMiddleware");
const serverRoutes = require("./route/route");
const { requestContext } = require("./middleware/requestContext");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);
app.set("trust proxy", 1);
//app.use(generalRateLimiter);
app.use(requestLogger);

app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")),
);
app.get("/api", (_req, res) => res.send("API is running!"));
//app.use("/api/auth", authRateLimiter);
app.use("/api", serverRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Server failed to process the data";
  res.status(status).json({ error: message });
});

module.exports = app;
