const {
  requireFields,
  httpError,
  assertAllowed,
} = require("../utility/httpUtility");

const enrollInCourse = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const unenrollInCourse = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

module.exports = { enrollInCourse, unenrollInCourse };
