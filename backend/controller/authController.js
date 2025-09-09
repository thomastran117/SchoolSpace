const {
  loginUser,
  signupUser,
  verifyUser,
  startMicrosoftOAuth,
  finishMicrosoftOAuth,
  startGoogleOAuth,
  finishGoogleOAuth,
  update_role
} = require("../service/authService");
const { requireFields, httpError, assertAllowed } = require("../utility/httpUtility");

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

    const { url } = await signupUser(email, password, role);
    res.status(201).json({ message: "Email sent. Please verify." });
  } catch (err) {
    next(err);
  }
};

const verify_email = async (req, res, next) => {
  try {
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

const microsoftStart = async (_req, res, next) => {
  try {
    const { url: authUrl, state, codeVerifier } = await startMicrosoftOAuth();
    setTemp(res, "ms_pkce", JSON.stringify({ state, codeVerifier }));
    res.redirect(authUrl);
  } catch (err) {
    next(err);
  }
};

const microsoftCallback = async (req, res, next) => {
  try {
    const params = url.parse(req.url, true).query;

    if (!params.code) {
      httpError(400, "Missing code");
    }
    if (wasCodeRedeemed(req, params.code)) {
      httpError(400, "Missing token");
    }

    const pkceRaw = popTemp(req, res, "ms_pkce");
    if (!pkceRaw) {
      httpError(400, "PKCE data missing (cookie expired?)");
    }
    const { state, codeVerifier } = JSON.parse(pkceRaw);

    const { token, role } = await finishMicrosoftOAuth(params, {
      state,
      codeVerifier,
    });

    const redirect = new URL("/auth/signed-in", process.env.FRONTEND_CLIENT);
    redirect.hash = `token=${encodeURIComponent(token)}&role=${encodeURIComponent(role)}`;
    return res.redirect(redirect.toString());
  } catch (err) {
    next(err);
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const googleStart = async (_req, res, next) => {
  try {
    const { url: authUrl, state, codeVerifier } = await startGoogleOAuth();
    setTemp(res, "g_pkce", JSON.stringify({ state, codeVerifier }));
    res.redirect(authUrl);
  } catch (err) {
    next(err);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const params = url.parse(req.url, true).query;

    if (!params.code) {
      httpError(400, "Missing code");
    }
    if (wasGCodeRedeemed(req, params.code)) {
      httpError(400, "Code already used");
    }

    const pkceRaw = popTemp(req, res, "g_pkce");
    if (!pkceRaw) {
      httpError(400, "PKCE data missing (cookie expired?)");
    }
    const { state, codeVerifier } = JSON.parse(pkceRaw);

    const { token, role } = await finishGoogleOAuth(params, {
      state,
      codeVerifier,
    });

    const redirect = new URL("/auth/signed-in", process.env.FRONTEND_CLIENT);
    redirect.hash = `token=${encodeURIComponent(token)}&role=${encodeURIComponent(role)}`;
    return res.redirect(redirect.toString());
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    req.user = await getUserPayload(authHeader);
    
    requireFields(["role"], req.body);
    const { role } = req.body;
    
    assertAllowed(role, ["student", "teacher", "assistant"]);

    const { token, role: userrole } = await update_role(id, role);
    res
      .status(200)
      .json({ message: "Login successful", token: token, role: userrole });
  } catch (err) {
    next(err);
  }
};

const wasCodeRedeemed = (req, code) => {
  if (!req.session) return false;
  if (req.session.lastMsCode === code) return true;
  req.session.lastMsCode = code;
  return false;
};

const wasGCodeRedeemed = (req, code) => {
  if (!req.session) return false;
  if (req.session.lastGCode === code) return true;
  req.session.lastGCode = code;
  return false;
};

module.exports = {
  login,
  signup,
  microsoftCallback,
  microsoftStart,
  verify_email,
  updateRole,
  googleStart,
  googleCallback,
};
