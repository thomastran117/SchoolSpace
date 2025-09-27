import {
  loginUser,
  signupUser,
  verifyUser,
  signupUserWOVerify,
  verifyMicrosoftIdTokenAndSignIn,
  loginOrCreateFromGoogle,
  generateRefreshToken,
} from "../service/authService.js";
import {
  requireFields,
  httpError,
  assertAllowed,
} from "../utility/httpUtility.js";
import logger from "../utility/logger.js";
import config from "../config/envManager.js";

const login = async (req, res, next) => {
  try {
    requireFields(["email", "password"], req.body);
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      httpError(400, "Invalid email format");
    }

    const { accessToken, refreshToken, role, id } = await loginUser(
      email,
      password,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Login successful", accessToken, role, email, id });
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

    const { token, role, email, id } =
      await verifyMicrosoftIdTokenAndSignIn(idToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Login successful", accessToken, role, email, id });
  } catch (err) {
    next(err);
  }
};

const googleVerify = async (req, res, next) => {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) {
      throw httpError(400, "Google token missing");
    }

    const { token, role, email, id } =
      await loginOrCreateFromGoogle(googleToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Login successful", accessToken, role, email, id });
  } catch (err) {
    next(err);
  }
};

const newAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return httpError(401, "Misisng refresh token");
    const accessToken = await generateRefreshToken(token);
    return res.json({ accessToken: accessToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out" });
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export {
  login,
  signup,
  logout,
  microsoftVerify,
  verify_email,
  googleVerify,
  newAccessToken,
};
