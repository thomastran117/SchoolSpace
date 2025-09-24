import {
  loginUser,
  signupUser,
  verifyUser,
  signupUserWOVerify,
  verifyMicrosoftIdTokenAndSignIn,
  loginOrCreateFromGoogle
} from "../service/authService.js";
import {
  requireFields,
  httpError,
  assertAllowed,
} from "../utility/httpUtility.js";
import logger from "../utility/logger.js";
import config from "../config/envManager.js";
import * as googleService from "../service/oauth/googleService.js";

const setTemp = (res, key, val) =>
  res.cookie(key, val, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  });

const popTemp = (req, res, key) => {
  const v = req.cookies[key];
  res.clearCookie(key);
  return v;
};

const login = async (req, res, next) => {
  try {
    requireFields(["email", "password"], req.body);
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      httpError(400, "Invalid email format");
    }

    const { token, role } = await loginUser(email, password);
    res
      .status(200)
      .json({ message: "Login successful", token: token, role: role });
  } catch (err) {
    next(err);
  }
};

const signup = async (req, res, next) => {
  try {
    requireFields(["email", "password", "role"], req.body);
    const { email, password, role } = req.body;

    assertAllowed(role, ["student", "teacher", "assistant"]);

    if (!validateEmail(email)) {
      httpError(400, "Invalid email format");
    }

    if (config.isEmailEnabled()) {
      const { url } = await signupUser(email, password, role);
      res.status(201).json({ message: "Email sent. Please verify." });
    } else {
      const { url } = await signupUserWOVerify(email, password, role);
      res.status(201).json({ message: "Verification skip. Please login." });
    }
  } catch (err) {
    next(err);
  }
};

const verify_email = async (req, res, next) => {
  try {
    if (!config.isEmailEnabled()) {
      logger.warn("Email verification is not avaliable");
      httpError(
        503,
        "Email verification is not avaliable. You don't need to access this route at the moment.",
      );
    }
    const { token } = req.query;
    if (!token) httpError(400, "Missing token");
    await verifyUser(token);
    res
      .status(201)
      .json({ message: "User created successfully. Please log in now." });
  } catch (err) {
    next(err);
  }
};

const microsoftVerify = async (req, res, next) => {
  try {
    if (!config.isMicrosoftEnabled()) {
      logger.warn("Microsoft OAuth is not available");
      return httpError(
        503,
        "Microsoft OAuth is not available. Please use another login method",
      );
    }

    const { id_token: idToken } = req.body || {};
    if (!idToken) return httpError(400, "Missing id_token");

    const { token, role, user } =
      await verifyMicrosoftIdTokenAndSignIn(idToken);

    return res.status(200).json({
      token,
      role,
      user,
    });
  } catch (err) {
    next(err);
  }
};

const googleVerify = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const googleUser = await googleService.verifyGoogleToken(token);

    if (!googleUser?.email) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const appToken = await loginOrCreateFromGoogle(googleUser);

    return res.status(200).json({ token: appToken });
  } catch (err) {
    next(err);
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export {
  login,
  signup,
  microsoftVerify,
  verify_email,
  googleVerify
};
