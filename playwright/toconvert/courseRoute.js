"use strict";
/**
 * @file courseRoute.js
 * @description Defines all course-related routes.
 *
 * @module route
 *
 * @version 1.0.0
 * @author Thomas
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Imports
 */
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../../toconvert/courseController");
const router = express_1.default.Router();
/**
 * @route POST /courses/
 * @description Creates a course.
 * @access Private
 */
router.post("/", courseController_1.addCourse);
/**
 * @route PUT /courses/:id
 * @description Update a course given an id.
 * @access Private
 */
router.put("/:id", courseController_1.updateCourse);
/**
 * @route DELETE /courses/:id
 * @description Deletes a course.
 * @access Private
 */
router.delete("/:id", courseController_1.deleteCourse);
/**
 * @route GET /courses/
 * @description Get a list of courses. Uses lazy loading and can filter for
 * courses with enrollment.
 * @access Private
 */
router.get("/", courseController_1.getCourses);
/**
 * @route GET /courses/student/:id
 * @description Get a list of courses that a student is enrolled in.
 * @access Private
 */
router.get("/student/:id", courseController_1.getCoursesByStudent);
router.get("/student/", courseController_1.getCoursesByStudent);
/**
 * @route GET /courses/teacher/:id
 * @description Get a list of courses that a teacher owns
 * @access Private
 */
router.get("/teacher/:id", courseController_1.getCoursesByTeacher);
router.get("/teacher/", courseController_1.getCoursesByTeacher);
/**
 * @route GET /courses/:id
 * @description Gets a course by its ID
 * @access Private
 */
router.get("/:id", courseController_1.getCourse);
// Export the router
exports.default = router;
