const express = require("express");
const { getCourse, getCourses, deleteCourse, updateCourse, addCourse, getCoursesByStudent, getCoursesByTeacher } = require("../controller/courseController");

const router = express.Router();
router.post("/", addCourse);
router.put("/:id", updateCourse)
router.delete("/:id", deleteCourse)
router.get("/", getCourses);
router.get("/student/id", getCoursesByStudent);
router.get("/teacher/:id", getCoursesByTeacher);
router.get("/:id", getCourse)

module.exports = router;
