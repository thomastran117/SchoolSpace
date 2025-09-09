const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const corsMiddleware = require("./middleware/corsConfig");
const { rateMiddleware, authMiddleware } = require("./middleware/rateConfig");
const requestLogger = require("./middleware/httpLogger");
const serverRoutes = require("./route/route");
const { requestContext } = require("./middleware/requestContext");

const port = process.env.PORT || 8040;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(corsMiddleware);
app.use(rateMiddleware);
app.use(requestLogger);

app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")),
);
app.get("/api", (_req, res) => res.send("API is running!"));
app.use("/api/auth", authMiddleware);
app.use("/api", serverRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Server failed to process the data";
  res.status(status).json({ error: message });
});

module.exports = app;
