/**
 * @file userRoute.js
 * @description Defines all user profile related routes and user fetching
 * @module route
 *
 * @version 1.0.0
 * @author Thomas
 */

/**
 * Imports
 */
const express = require("express");
const {
  updateUser,
  deleteUser,
  getStudentsByCourse,
  getTeacherByCourse,
  getUser,
} = require("../controller/userController");

const router = express.Router();

/**
 * @route PUT /users/:id
 * @description Update an user profile information by ID
 * @access Private
 */
router.put("/users/:id", updateUser);

/**
 * @route DELETE /users/:id
 * @description Deletes an user by id
 * @access Private
 */
router.delete("/users/:id", deleteUser);

/**
 * @route POST /users/:id
 * @description Get teacher by course id
 * @access Private
 */
router.get("/users/teacher/:id", getTeacherByCourse);

/**
 * @route GET /users/student/:id
 * @description Get students by course Id
 * @access Private
 */
router.get("/users/student/:id", getStudentsByCourse);

/**
 * @route GET /users/:id
 * @description Gets an user by id
 * @access Private
 */
router.get("/:id", getUser);

// Export the router
module.exports = router;
