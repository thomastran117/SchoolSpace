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
    throw httpError(400, `${name} must be a positive integer`);
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

const validateString = (value, fieldName, maxLength = 50) => {
  if (value === undefined || value === null) return undefined;

  const trimmed = value.trim();

  if (!trimmed) return undefined;

  const pattern = new RegExp(`^[A-Za-zÀ-ÖØ-öø-ÿ\\s'-]{2,${maxLength}}$`);

  if (!pattern.test(trimmed)) {
    throw httpError(
      400,
      `${fieldName} must contain only letters and spaces (max ${maxLength} characters).`,
    );
  }

  return trimmed;
};

export { validateEmail, validateString, isBoolean, validatePositiveInt };
