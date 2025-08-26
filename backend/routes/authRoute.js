const express = require("express");
const { login, signup, microsoftStart, microsoftCallback } = require("../controller/authController");

const router = express.Router();
router.post("/login", login);
router.post("/signup", signup);
router.get("/microsoft/start", microsoftStart);
router.get("/microsoft/callback", microsoftCallback);

module.exports = router;