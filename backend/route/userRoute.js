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
import express from "express";
import {
  updateUser,
  updateRole,
  updateAvatar,
  deleteUser,
  getStudentsByCourse,
  getTeacherByCourse,
  getUser,
} from "../controller/userController.js";
import { uploadAvatar } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @route PUT /users/:id
 * @description Updates an user avatar
 * @access Private
 */
router.post("/avatar/", uploadAvatar.single("avatar"), updateAvatar);

/**
 * @route PUT /users/:id
 *
 * @description Update an user profile information by ID
 * @access Private
 */
router.put("/:id", updateUser);

/**
 * @route DELETE /users/:id
 * @description Deletes an user by id
 * @access Private
 */
router.delete("/:id", deleteUser);

/**
 * @route POST /users/:id
 * @description Get teacher by course id
 * @access Private
 */
router.get("/teacher/:id", getTeacherByCourse);

/**
 * @route GET /users/student/:id
 * @description Get students by course Id
 * @access Private
 */
router.get("/student/:id", getStudentsByCourse);

/**
 * @route GET /users/:id
 * @description Gets an user by id
 * @access Private
 */
router.get("/:id", getUser);
router.get("/", getUser);

// Export the router
export default router;
