/**
 * @file courseRoute.js
 * @description Defines all course-related routes.
 *
 * @module route
 *
 * @version 1.0.0
 * @author Thomas
 */

/**
 * Imports
 */
import express, { Router } from "express";
import {
  getCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  addCourse,
  getCoursesByStudent,
  getCoursesByTeacher,
} from "../controller/courseController";

const router: Router = express.Router();

/**
 * @route POST /courses/
 * @description Creates a course.
 * @access Private
 */
router.post("/", addCourse);

/**
 * @route PUT /courses/:id
 * @description Update a course given an id.
 * @access Private
 */
router.put("/:id", updateCourse);

/**
 * @route DELETE /courses/:id
 * @description Deletes a course.
 * @access Private
 */
router.delete("/:id", deleteCourse);

/**
 * @route GET /courses/
 * @description Get a list of courses. Uses lazy loading and can filter for
 * courses with enrollment.
 * @access Private
 */
router.get("/", getCourses);

/**
 * @route GET /courses/student/:id
 * @description Get a list of courses that a student is enrolled in.
 * @access Private
 */
router.get("/student/:id", getCoursesByStudent);
router.get("/student/", getCoursesByStudent);

/**
 * @route GET /courses/teacher/:id
 * @description Get a list of courses that a teacher owns
 * @access Private
 */
router.get("/teacher/:id", getCoursesByTeacher);
router.get("/teacher/", getCoursesByTeacher);

/**
 * @route GET /courses/:id
 * @description Gets a course by its ID
 * @access Private
 */
router.get("/:id", getCourse);

// Export the router
export default router;
