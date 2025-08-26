const express = require("express");
require("dotenv").config();

const corsMiddleware = require("./middleware/corsConfig");
const { rateMiddleware, authMiddleware } = require("./middleware/rateConfig");
const requestLogger = require("./middleware/httpLogger");
const authRoute = require("./routes/authRoute");
const { requestContext } = require("./middleware/requestContext");

const port = process.env.PORT || 8040;
const app = express();

app.use(express.json());

app.use(corsMiddleware);
app.use(rateMiddleware);
app.use(requestLogger);
app.use("/api/auth", authMiddleware);
app.use("/api/auth", authRoute);

app.get("/", (_req, res) => res.send("Server is running!"));
app.get("/api", (_req, res) => res.send("API is running!"));

app.listen(port, () => {
  console.log("The server is now running!");
  console.log(`http://localhost:${port}`);
});
