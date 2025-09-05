const express = require("express");
const {
  updateUser,
  deleteUser,
  getStudentByCourse,
  getTeacherByCourse,
  getUser,
} = require("../controller/userController");

const router = express.Router();

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/course-t/id", getTeacherByCourse);
router.get("/course-s/:id", getStudentByCourse);
router.get("/:id", getUser);

module.exports = router;
