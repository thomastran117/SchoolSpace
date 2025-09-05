const getStudentByCourse = async () => {
  try {
    const error = new Error("Not implemented");
    error.statusCode = 501;
    throw error;
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "Endpoint failed";
    res.status(status).json({ error: message });
  }
};

const getTeacherByCourse = async () => {
  try {
    const error = new Error("Not implemented");
    error.statusCode = 501;
    throw error;
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "Endpoint failed";
    res.status(status).json({ error: message });
  }
};

const getUser = async () => {
  try {
    const error = new Error("Not implemented");
    error.statusCode = 501;
    throw error;
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "Endpoint failed";
    res.status(status).json({ error: message });
  }
};

const updateUser = async () => {
  try {
    const error = new Error("Not implemented");
    error.statusCode = 501;
    throw error;
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "Endpoint failed";
    res.status(status).json({ error: message });
  }
};

const deleteUser = async () => {
  try {
    const error = new Error("Not implemented");
    error.statusCode = 501;
    throw error;
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "Endpoint failed";
    res.status(status).json({ error: message });
  }
};

module.exports = {
  updateUser,
  deleteUser,
  getStudentByCourse,
  getTeacherByCourse,
  getUser,
};
