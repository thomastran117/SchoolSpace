const { getUserPayload } = require("../service/tokenService");
const config = require("../config/envManager");

const CLIENT = config.frontend_client;
const API_KEY = config.schoolspace_api_key;

const makeRequireAuth = async (req, res, next) => {
  try {
    const origin = req.headers.origin;
    const apiKey = req.headers["schoolspace-api-key"];
    const authHeader = req.headers.authorization;

    if (origin === CLIENT) {
      if (!authHeader) {
        return res.status(401).json({ error: "Missing Authorization header" });
      }
      req.user = await getUserPayload(authHeader);
      return next();
    }

    if (apiKey === API_KEY) {
      if (!authHeader) {
        return res.status(401).json({ error: "Missing Authorization header" });
      }
      req.user = await getUserPayload(authHeader); 
      // TODO: later map apiKey → user/service identity
      return next();
    }

    return res.status(403).json({ error: "Forbidden" });
  } catch (e) {
    return res
      .status(e.statusCode || 401)
      .json({ error: e.message || "Unauthorized" });
  }
};

module.exports = { makeRequireAuth };
