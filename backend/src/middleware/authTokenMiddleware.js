/**
 * @file authTokenMiddleware.js
 * @description  This middleware protects routes requesting an access token to access. Adds the
 * user payload to the request object to be access by the controller
 *
 * @module middleware
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// Token service
import { getUserPayload } from "../service/tokenService.js";

/**
 * Express middleware that enforces authentication via JWT access token.
 *
 * - Extracts the `Authorization` header (`Bearer <token>`).
 * - Validates the token using `getUserPayload`.
 * - Attaches the decoded user payload to `req.user`.
 * - Returns `401 Unauthorized` if token is missing, invalid, or expired.
 *
 * @async
 * @function makeRequireAuth
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @example
 * import { makeRequireAuth } from "./middleware/authToken.js";
 *
 * app.get("/protected", makeRequireAuth, (req, res) => {
 *   res.json({ message: `Hello, ${req.user.id}` });
 * });
 */
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
