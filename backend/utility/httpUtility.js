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

function assertAllowed(value, allowed, fieldName = "field") {
  if (!allowed.includes(value)) {
    message = `${fieldName} must be one of: ${allowed.join(", ")}`;
    httpError(400, message);
  }
  return true;
}

function validatePositiveInt(value, name = "id") {
  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    throw httpError(400, `${name} must be a positive integer`);
  }

  return num;
}

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

function httpResponse(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = {
  requireFields,
  requiresAtLeastOneField,
  validatePositiveInt,
  httpError,
  assertAllowed,
};
