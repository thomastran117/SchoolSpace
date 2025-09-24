import {
  requireFields,
  httpError,
  assertAllowed,
} from "../utility/httpUtility.js";
import {
  get_students_by_course,
  get_teacher_by_course,
  get_user,
  get_users,
  delete_user,
  update_role,
} from "../service/userService.js";
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
    await delete_user(userId);
    res.status(200).json({ message: "User deleted." });
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id: authUserId, role } = req.user;
    if (role !== "undefined") {
      httpError(409, "The user already has a role");
    }

    requireFields(["role"], req.body);
    const { role: userRole } = req.body;

    assertAllowed(role, ["student", "teacher", "assistant"]);

    const { token, role: userrole } = await update_role(authUserId, userRole);
    res.status(200).json({
      message: "Role updated. New token provided",
      token: token,
      role: userrole,
    });
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
