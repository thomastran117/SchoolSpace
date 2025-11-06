"use strict";
/**
 * @file userRoute.js
 * @description Defines all user profile related routes and user fetching
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
const userController_1 = require("../../toconvert/userController");
const uploadMiddleware_js_1 = require("../middleware/uploadMiddleware.js");
const router = express_1.default.Router();
/**
 * @route PUT /users/:id
 * @description Updates an user avatar
 * @access Private
 */
router.post("/avatar/", uploadMiddleware_js_1.uploadAvatar.single("avatar"), userController_1.updateAvatar);
/**
 * @route PUT /users/:id
 *
 * @description Update an user profile information by ID
 * @access Private
 */
router.put("/:id", userController_1.updateUser);
router.put("/", userController_1.updateUser);
/**
 * @route DELETE /users/:id
 * @description Deletes an user by id
 * @access Private
 */
router.delete("/:id", userController_1.deleteUser);
/**
 * @route POST /users/:id
 * @description Get teacher by course id
 * @access Private
 */
router.get("/teacher/:id", userController_1.getTeacherByCourse);
/**
 * @route GET /users/student/:id
 * @description Get students by course Id
 * @access Private
 */
router.get("/student/:id", userController_1.getStudentsByCourse);
/**
 * @route GET /users/:id
 * @description Gets an user by id
 * @access Private
 */
router.get("/:id", userController_1.getUser);
router.get("/", userController_1.getUser);
// Export the router
exports.default = router;
