/**
 * @file httpUtility.js
 * @description Utility file that helps with validation for HTTP requests and errors
 *
 * @module utility
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

/**
 * Ensures that all required fields are present in the request body.
 *
 * @param {string[]} fields - List of required field names.
 * @param {object} body - Request body object.
 * @throws {Error} If any required fields are missing.
 *
 * @example
 * requireFields(["email", "password"], req.body);
 */
function requireFields(fields, body) {
  const missing = fields.filter((field) => !body[field]);

  if (missing.length > 0) {
    const message =
      missing.length === 1
        ? `${missing[0]} is required`
        : `${missing.join(", ")} are required`;

    httpError(400, message);
  }
}

/**
 * Ensures that at least one of the specified fields is present in the request body.
 *
 * @param {string[]} fields - List of possible field names.
 * @param {object} body - Request body object.
 * @throws {Error} If none of the fields are provided.
 *
 * @example
 * requiresAtLeastOneField(["username", "email"], req.body);
 */
function requiresAtLeastOneField(fields, body) {
  const provided = fields.filter(
    (field) => body[field] !== undefined && body[field] !== null,
  );

  if (provided.length === 0) {
    const message =
      fields.length === 1
        ? `At least ${fields[0]} is required`
        : `At least one of [${fields.join(", ")}] is required`;

    throw httpError(400, message);
  }
}

/**
 * Validates that a given value is within an allowed set of values.
 *
 * @param {string} value - The provided value.
 * @param {string[]} allowed - Array of allowed values.
 * @param {string} [fieldName="field"] - Name of the field being validated (used in error message).
 * @returns {boolean} Returns true if valid.
 * @throws {Error} If the value is not in the allowed list.
 *
 * @example
 * assertAllowed(role, ["student", "teacher", "assistant"], "role");
 */
function assertAllowed(value, allowed, fieldName = "field") {
  if (!allowed.includes(value)) {
    const message = `${fieldName} must be one of: ${allowed.join(", ")}`;
    httpError(400, message);
  }
  return true;
}

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
    throw httpError(400, `${name} must be a positive integer`);
  }

  return num;
}

/**
 * Creates and throws an HTTP error.
 *
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Error message.
 * @throws {Error} Always throws the constructed error.
 *
 * @example
 * httpError(404, "User not found");
 *
 * Defers the response to app.js
 */
function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

/**
 * Creates an HTTP-like response error object without throwing it.
 *
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Message to attach.
 * @returns {Error} Error object with statusCode.
 *
 * @example
 * return httpResponse(200, "Success");
 */
function httpResponse(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export {
  requireFields,
  requiresAtLeastOneField,
  validatePositiveInt,
  httpError,
  assertAllowed,
};
