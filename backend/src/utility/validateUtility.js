import { httpError } from "./httpUtility.js";

/**
 * Utility: Validates email format.
 *
 * @param {string} email
 * @returns {boolean}
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a value is a positive integer.
 *
 * @param {string|number} value - The value to validate.
 * @param {string} [name="id"] - The field name for error messaging.
 * @returns {number} The validated integer value.
 * @throws {Error} If the value is not a positive integer.
 *
 * @example
 * const userId = validatePositiveInt(req.params.id, "userId");
 */
function validatePositiveInt(value, name = "id") {
  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    httpError(400, `${name} must be a positive integer`);
  }

  return num;
}

/**
 * Validates that a value is a positive integer.
 *
 * @param {string|number} value - The value to validate.
 * @returns {number} The validated integer value or undefined if invalid
 *
 * @example
 * const userId = validatePositiveInt(req.params.id, "userId");
 */
function optionalValidateId(value) {
  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    return undefined;
  }

  return num;
}

/**
 * Validates that a string is a boolean
 *
 * @param {str|boolean} str - The value to validate.
 * @returns {boolean} The boolean value
 * @throws {Error} If the value is not a positive integer.
 *
 * @example
 * const remember = isBoolean(req.body.remember);
 */
function isBoolean(str) {
  if (typeof str === "boolean") return str;

  if (typeof str === "string") {
    const lower = str.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }

  return false;
}

/**
 * Validates and sanitizes a text field that should contain only letters and spaces.
 * Provides detailed error messages for invalid characters or excessive length.
 *
 * @param {string | undefined | null} value - The value to validate.
 * @param {string} fieldName - The field name for contextual error messages.
 * @param {number} [maxLength=50] - Optional maximum length.
 * @param {number} [minLength=2] - Optional minimum length (default: 2).
 * @returns {string | undefined} - The sanitized value or undefined if empty.
 * @throws {Error} - Throws an httpError(400, ...) if invalid.
 */
const validateString = (value, fieldName, maxLength = 50, minLength = 2) => {
  if (value === undefined || value === null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.length < minLength) {
    httpError(
      400,
      `${fieldName} must be at least ${minLength} characters long.`,
    );
  }
  if (trimmed.length > maxLength) {
    httpError(400, `${fieldName} must not exceed ${maxLength} characters.`);
  }

  const allowedPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
  if (!allowedPattern.test(trimmed)) {
    const invalidChar = trimmed
      .split("")
      .find((ch) => !allowedPattern.test(ch));
    httpError(
      400,
      `${fieldName} contains invalid character "${invalidChar}". Only letters, spaces, apostrophes, and hyphens are allowed.`,
    );
  }

  return trimmed;
};

/**
 * Validates and sanitizes a string containing letters, numbers, spaces, apostrophes, or hyphens.
 * Provides precise error feedback (too short, too long, or invalid character).
 *
 * @param {string | undefined | null} value - The value to validate.
 * @param {string} fieldName - The field name for error context.
 * @param {number} [maxLength=50] - Maximum allowed length.
 * @param {number} [minLength=2] - Minimum required length.
 * @returns {string | undefined} - Sanitized string or undefined if not provided.
 * @throws {Error} - Throws httpError(400, ...) for invalid input.
 */
const validateAlphaNumericString = (
  value,
  fieldName,
  maxLength = 50,
  minLength = 2,
) => {
  if (value === undefined || value === null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.length < minLength) {
    httpError(
      400,
      `${fieldName} must be at least ${minLength} characters long.`,
    );
  }

  if (trimmed.length > maxLength) {
    httpError(400, `${fieldName} must not exceed ${maxLength} characters.`);
  }

  const allowedPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s'-]+$/;

  if (!allowedPattern.test(trimmed)) {
    const invalidChar = trimmed
      .split("")
      .find((ch) => !allowedPattern.test(ch));

    httpError(
      400,
      `${fieldName} contains invalid character "${invalidChar}". Only letters, numbers, spaces, apostrophes, and hyphens are allowed.`,
    );
  }

  return trimmed;
};

/**
 * Validates and sanitizes a phone number string.
 * Accepts digits, spaces, plus, parentheses, and dashes.
 * Ensures reasonable length (7–20 characters).
 *
 * @param {string | undefined | null} value - The phone number to validate.
 * @param {string} [fieldName='Phone'] - The field name for clearer error messages.
 * @param {number} [maxLength=20] - Maximum allowed length.
 * @param {number} [minLength=7] - Minimum allowed length.
 * @returns {string | undefined} - The sanitized phone number, or undefined if not provided.
 * @throws {Error} - Throws httpError(400, ...) if invalid.
 */
const validatePhone = (
  value,
  fieldName = "Phone",
  maxLength = 20,
  minLength = 7,
) => {
  if (value === undefined || value === null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Length validation
  if (trimmed.length < minLength) {
    httpError(
      400,
      `${fieldName} must be at least ${minLength} characters long.`,
    );
  }
  if (trimmed.length > maxLength) {
    httpError(400, `${fieldName} must not exceed ${maxLength} characters.`);
  }

  const allowedPattern = /^[\d\s()+-]+$/;

  if (!allowedPattern.test(trimmed)) {
    const invalidChar = trimmed
      .split("")
      .find((ch) => !allowedPattern.test(ch));
    httpError(
      400,
      `${fieldName} contains invalid character "${invalidChar}". Only digits, spaces, '+', '-', and parentheses are allowed.`,
    );
  }

  const digitCount = (trimmed.match(/\d/g) || []).length;
  if (digitCount < 7) {
    httpError(400, `${fieldName} must contain at least 7 digits.`);
  }

  return trimmed;
};

/**
 * Validates and sanitizes a street or mailing address.
 * Allows letters, numbers, spaces, commas, periods, hyphens, and apostrophes.
 *
 * @param {string | undefined | null} value - The address string.
 * @param {string} [fieldName='Address'] - Field name for context.
 * @param {number} [maxLength=100] - Max allowed length.
 * @param {number} [minLength=5] - Min required length.
 * @returns {string | undefined} - Sanitized address or undefined if not provided.
 * @throws {Error} - Throws httpError(400, ...) if invalid.
 */
const validateAddress = (
  value,
  fieldName = "Address",
  maxLength = 100,
  minLength = 5,
) => {
  if (value === undefined || value === null) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.length < minLength) {
    httpError(
      400,
      `${fieldName} must be at least ${minLength} characters long.`,
    );
  }
  if (trimmed.length > maxLength) {
    httpError(400, `${fieldName} must not exceed ${maxLength} characters.`);
  }

  const allowedPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s,.'-]+$/;

  if (!allowedPattern.test(trimmed)) {
    const invalidChar = trimmed
      .split("")
      .find((ch) => !allowedPattern.test(ch));
    httpError(
      400,
      `${fieldName} contains invalid character "${invalidChar}". Only letters, numbers, spaces, commas, periods, apostrophes, and hyphens are allowed.`,
    );
  }

  return trimmed;
};

export {
  validateEmail,
  validateString,
  validateAlphaNumericString,
  isBoolean,
  validatePositiveInt,
  optionalValidateId,
  validateAddress,
  validatePhone,
};
