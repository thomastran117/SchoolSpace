const enrollInCourse = async (req, res) => {
  try {
    const error = new Error("Not implemented");
    error.statusCode = 501;
    throw error;
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "Endpoint failed";
    res.status(status).json({ error: message });
  }
}

const unenrollInCourse = async (req, res) => {
  try {
    const error = new Error("Not implemented");
    error.statusCode = 501;
    throw error;
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "Endpoint failed";
    res.status(status).json({ error: message });
  }
}

module.exports = { enrollInCourse, unenrollInCourse };