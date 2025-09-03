const express = require("express");
const {
  login,
  signup,
  microsoftStart,
  microsoftCallback,
  verify_email,
  googleStart,
  googleCallback,
} = require("../controller/authController");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/verify", verify_email);
router.get("/microsoft/start", microsoftStart);
router.get("/microsoft/callback", microsoftCallback);
router.get("/google/start", googleStart);
router.get("/google/callback", googleCallback);

module.exports = router;
