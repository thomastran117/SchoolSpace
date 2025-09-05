const addCourse = async (req, res) => {
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

const updateCourse = async (req, res) => {
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

const deleteCourse = async (req, res) => {
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

const getCourse = async (req, res) => {
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

const getCourses = async (req, res) => {
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

const getCoursesByTeacher = async (req, res) => {
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

const getCoursesByStudent = async (req, res) => {
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

module.exports = { getCourse, getCourses, deleteCourse, updateCourse, addCourse, getCoursesByStudent, getCoursesByTeacher }