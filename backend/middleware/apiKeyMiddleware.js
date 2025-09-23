import { getUserPayload } from "../service/tokenService.js";
import config from "../config/envManager.js";

const API_KEY = config.schoolspace_api_key;

async function requireApiKeyAuth(req, res, next) {
  try {
    const apiKey = req.get("schoolspace-api-key") || req.get("x-api-key");
    const authHeader = req.get("authorization");

    if (!apiKey || apiKey !== API_KEY) {
      return res.status(403).json({ error: "Forbidden: invalid API key" });
    }

    if (!authHeader) {
      return res.status(401).json({ error: "Missing JWT" });
    }

    req.user = await getUserPayload(authHeader);
    return next();
  } catch (e) {
    return res
      .status(e.statusCode || 401)
      .json({ error: e.message || "Unauthorized" });
  }
}

export { requireApiKeyAuth };
