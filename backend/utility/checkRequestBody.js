function requireFields(fields, body) {
  const missing = fields.filter((field) => !body[field]);

  if (missing.length > 0) {
    const message =
      missing.length === 1
        ? `${missing[0]} is required`
        : `${missing.join(", ")} are required`;

    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
}

module.exports = { requireFields };
