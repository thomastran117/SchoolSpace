const {
  requireFields,
  httpError,
  assertAllowed,
} = require("../utility/httpUtility");

const addCourse = async (req, res, next) => {
  try {
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const getCourse = async (req, res, next) => {
  try {
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const getCourses = async (req, res, next) => {
  try {
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const getCoursesByTeacher = async (req, res, next) => {
  try {
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const getCoursesByStudent = async (req, res, next) => {
  try {
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  addCourse,
  getCoursesByStudent,
  getCoursesByTeacher,
};
