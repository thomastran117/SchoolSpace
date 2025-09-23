import { getUserPayload } from "../service/tokenService.js";

const makeRequireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    req.user = await getUserPayload(authHeader);
    next();
  } catch (e) {
    res
      .status(e.statusCode || 401)
      .json({ error: e.message || "Unauthorized" });
  }
};

export { makeRequireAuth };
