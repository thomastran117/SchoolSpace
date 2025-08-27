const {
  loginUser,
  signupUser,
  verifyUser,
  startMicrosoftOAuth,
  finishMicrosoftOAuth,
} = require("../service/authService");
const { sendEmail } = require("../service/emailService");
const url = require("url");

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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    if (!validateEmail(email)) {
      const error = new Error("Invalid email format");
      error.statusCode = 400;
      throw error;
    }

    const { token, role } = await loginUser(email, password);
    res
      .status(200)
      .json({ message: "Login successful", token: token, role: role });
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "User login failed";
    res.status(status).json({ error: message });
  }
};

const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      const error = new Error("Email, password and role are required");
      error.statusCode = 400;
      throw error;
    }

    if (!validateEmail(email)) {
      const error = new Error("Invalid email format");
      error.statusCode = 400;
      throw error;
    }

    const { url } = await signupUser(email, password, role);
    res.status(201).json({ message: "Email sent. Please verify." });
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "User verification failed";
    res.status(status).json({ error: message });
  }
};

const verify_email = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");
    await verifyUser(token);
    res
      .status(201)
      .json({ message: "User created successfully. Please log in now." });
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "User registration failed";
    res.status(status).json({ error: message });
  }
};

const wasCodeRedeemed = (req, code) => {
  if (!req.session) return false;
  if (req.session.lastMsCode === code) return true;
  req.session.lastMsCode = code;
  return false;
};

const microsoftStart = async (_req, res, next) => {
  try {
    const { url: authUrl, state, codeVerifier } = await startMicrosoftOAuth();
    setTemp(res, "ms_pkce", JSON.stringify({ state, codeVerifier }));
    res.redirect(authUrl);
  } catch (e) {
    next(e);
  }
};

const microsoftCallback = async (req, res, next) => {
  try {
    const params = url.parse(req.url, true).query;

    if (!params.code) {
      const e = new Error("missing code");
      e.statusCode = 400;
      throw e;
    }
    if (wasCodeRedeemed(req, params.code)) {
      const e = new Error("auth code already used");
      e.statusCode = 400;
      throw e;
    }

    const pkceRaw = popTemp(req, res, "ms_pkce");
    if (!pkceRaw) {
      const e = new Error("PKCE data missing (cookie expired?)");
      e.statusCode = 400;
      throw e;
    }
    const { state, codeVerifier } = JSON.parse(pkceRaw);

    const { token, role } = await finishMicrosoftOAuth(params, {
      state,
      codeVerifier,
    });

    const redirect = new URL("/auth/signed-in", process.env.FRONTEND_CLIENT);
    redirect.hash = `token=${encodeURIComponent(token)}&role=${encodeURIComponent(role)}`;
    return res.redirect(redirect.toString());
  } catch (e) {
    next(e);
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  login,
  signup,
  microsoftCallback,
  microsoftStart,
  verify_email,
};
