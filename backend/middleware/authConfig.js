const { getUserPayload } = require("./service/tokenService");

const makeRequireAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      req.user = await getUserPayload(authHeader);
      next();
    } catch (e) {
      res.status(e.statusCode || 401).json({ error: e.message || "Unauthorized" });
    }
};

module.exports = { makeRequireAuth };
