import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import logger from "./utility/logger.js";
import { fileURLToPath } from "url";
import corsMiddleware from "./middleware/corsMiddleware.js";
import {
  generalRateLimiter,
  authRateLimiter,
} from "./middleware/rateLimiterMiddleware.js";
import requestLogger from "./middleware/httpLoggerMiddleware.js";
import serverRoutes from "./route/route.js";
import { requestContext } from "./middleware/requestContext.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(corsMiddleware);
app.options(/.*/, corsMiddleware);
app.set("trust proxy", 1);
app.use(generalRateLimiter);
app.use(requestLogger);

app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")),
);
app.get("/api", (_req, res) => res.send("API is running!"));
app.use("/api/auth", authRateLimiter);
app.use("/api", serverRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Server failed to process the data";

  if (err.statusCode === 500) {
    logger.error(`Server failed to process the data: ${err.message}`);
  }
  res.status(status).json({ error: message });
});

export default app;
