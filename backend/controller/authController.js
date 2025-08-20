const express = require("express");
const { loginUser, signupUser, loginWithGoogle } = require("../service/authService");
const passport = require("../oauth/googlePassport");
const { createToken } = require("../service/tokenService");
const crypto = require("crypto");

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

const loginGoogle =  async (req, res, next) => {
  try {
    const { idToken } = req.body
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    const result = await loginWithGoogle(idToken);
    res.json(result);
  } catch (e) { next(e); }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const router = express.Router();
router.post("/login", login);
router.post("/signup", signup);
router.post("/google", loginGoogle);

router.get("/google", (req, res, next) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 5 * 60 * 1000,
  });
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state,
    prompt: "select_account",
  })(req, res, next);
});

router.get("/google/callback",
  (req, res, next) => {
    const cookieState = req.cookies?.oauth_state;
    if (!cookieState || cookieState !== req.query.state) {
      return res.redirect(`${process.env.FRONTEND_CLIENT}/login?error=state`);
    }
    res.clearCookie("oauth_state");
    next();
  },
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_CLIENT}/login?error=google`,
    session: false,
  }),
  async (req, res) => {
    const token = await createToken(req.user.id, req.user.email, req.user.role);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.FRONTEND_CLIENT}/oauth/callback`);
  }
);

module.exports = router;
