const express = require("express");
const { loginUser, signupUser, loginWithGoogle } = require("../service/authService");

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

module.exports = router;
