const express = require("express");
const authRoute = require("./authRoute");
const couresRoute = require("./courseRoute");
const enrollRoute = require("./enrollRoute");
const userRoute = require("./userRoute");
const { makeRequireAuth } = require("../middleware/authConfig");

const router = express.Router();

// Unprotected routes for login/signup locally or with OAuth
router.use("/auth", authRoute);

// Protected routes, requires authenication
router.use(makeRequireAuth);
router.use("/courses", couresRoute);
router.use("/course-enroll", enrollRoute);
router.use("/user", userRoute);

module.exports = router;
