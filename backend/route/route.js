const express = require("express");
const authRoute = require("./authRoute");
const couresRoute = require("./courseRoute");
const enrollRoute = require("./enrollRoute")
const userRoute = require("./userRoute");

const router = express.Router();

router.use("/auth", authRoute);
router.use("/courses", couresRoute);
router.use("/course-enroll", enrollRoute)
router.use("/user", userRoute);

module.exports = router;