const express = require("express");
const {
  enrollInCourse,
  unenrollInCourse,
} = require("../controller/enrollController");
const router = express.Router();

router.post("/:id", enrollInCourse);
router.delete("/:id", unenrollInCourse);

module.exports = router;
