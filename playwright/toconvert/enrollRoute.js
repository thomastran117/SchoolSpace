"use strict";
/**
 * @file enrollRoute.js
 * @description Defines all enrollment related routes for courses
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
const enrollController_js_1 = require("../../toconvert/enrollController.js");
const router = express_1.default.Router();
/**
 * @route POST /course-enroll/:id
 * @description Enroll a course.
 * @access Private
 */
router.post("/:id", enrollController_js_1.enrollInCourse);
/**
 * @route DELETE /course-enroll/:id
 * @description Unenroll a course.
 * @access Private
 */
router.delete("/:id", enrollController_js_1.unenrollInCourse);
// Export the router
exports.default = router;
