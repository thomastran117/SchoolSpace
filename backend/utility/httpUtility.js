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

module.exports = { requireFields, httpError };
