const { loginUser, signupUser, startMicrosoftOAuth, finishMicrosoftOAuth } = require("../service/authService");

const setTemp = (res, key, val) =>
  res.cookie(key, val, { httpOnly: true, sameSite: "lax", maxAge: 5 * 60 * 1000 });
const popTemp = (req, res, key) => { const v = req.cookies[key]; res.clearCookie(key); return v; };

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
    res.status(200).json({ message: "Login successful", token: token, role: role });
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

    const { user } = await signupUser(email, password, role);
    res.status(201).json({ message: "User created successfully."});
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "User verification failed";
    res.status(status).json({ error: message });
  }
};

const microsoftStart = async (_req, res, next) => {
  try {
    const { url: authUrl, state, codeVerifier } = await startMicrosoftOAuth();
    setTemp(res, "ms_state", state);
    setTemp(res, "ms_code_verifier", codeVerifier);
    res.redirect(authUrl);
  } catch (e) { next(e); }
};

const microsoftCallback = async (req, res, next) => {
  try {
    const params = url.parse(req.url, true).query;
    const expected = {
      state: popTemp(req, res, "ms_state"),
      codeVerifier: popTemp(req, res, "ms_code_verifier"),
    };
    const { token, role } = await finishMicrosoftOAuth(params, expected);

    const redirect = new URL("/auth/signed-in", CLIENT_APP_URL);
    redirect.hash = `token=${encodeURIComponent(token)}&role=${encodeURIComponent(role)}`;
    return res.redirect(redirect.toString());
  } catch (e) { next(e); }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = { login, signup, microsoftCallback, microsoftStart}
