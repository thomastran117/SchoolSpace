/**
 * @file enrollRoute.js
 * @description Defines all enrollment related routes for courses
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
  enrollInCourse,
  unenrollInCourse,
} from "../controller/enrollController.js";

const router: Router = express.Router();

/**
 * @route POST /course-enroll/:id
 * @description Enroll a course.
 * @access Private
 */
router.post("/:id", enrollInCourse);

/**
 * @route DELETE /course-enroll/:id
 * @description Unenroll a course.
 * @access Private
 */
router.delete("/:id", unenrollInCourse);

// Export the router
export default router;
