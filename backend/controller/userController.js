import {
  requireFields,
  httpError,
  assertAllowed,
} from "../utility/httpUtility.js";

const getStudentsByCourse = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const getTeacherByCourse = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    req.user = await getUserPayload(authHeader);

    requireFields(["role"], req.body);
    const { role } = req.body;

    assertAllowed(role, ["student", "teacher", "assistant"]);

    const { token, role: userrole } = await update_role(id, role);
    res
      .status(200)
      .json({ message: "Login successful", token: token, role: userrole });
  } catch (err) {
    next(err);
  }
};

export {
  updateUser,
  deleteUser,
  getStudentsByCourse,
  getTeacherByCourse,
  getUser,
};
