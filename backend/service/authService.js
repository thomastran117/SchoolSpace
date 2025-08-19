/**
 * @file authService.js
 * @description A service module for handling user authentication and authorization, including user login, registration, verification, and password management.
 *
 * This module interacts with the Prisma ORM to manage user data, integrates with the bcrypt library for secure password hashing and comparison, and sends verification emails using an external email service.
 *
 * The service exposes methods for:
 * - Logging in a user (`loginUser`).
 * - Creating a new user after email verification (`createUser`).
 * - Verifying a user's email address (`verifyUser`).
 * - Changing a user's password (`changePassword`), though this functionality is not yet implemented.
 * - Requesting a password change (`requestChange`), though this functionality is not yet implemented.
 *
 * @module service
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

const bcrypt = require("bcrypt");
const prisma = require("../resource/prisma");
const {
  createToken,
  createVerificationToken,
  getVerificationToken,
} = require("./tokenService");

/**
 * Logs in a user by verifying their email and password.
 *
 * This method checks if the user exists in the database and if the provided password matches the hashed password stored in the database.
 * If the credentials are valid, it generates a JWT token for the user.
 *
 * @function loginUser
 * @param {string} email - The email of the user attempting to log in.
 * @param {string} password - The password provided by the user.
 * @returns {Object} - An object containing the generated JWT token and the user's role.
 * @throws {Error} - Throws an error if the user is not found or the credentials are invalid.
 */
const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = await createToken(user.id, user.email, user.role);
  return { token: token, role: user.role };
};

const signupUser = async (email, password, role) => {

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await prisma.user.create({
    data: {
      email,
      password,
      role,
    },
  });

  return user;
};


module.exports = {
  signupUser,
  loginUser,
};