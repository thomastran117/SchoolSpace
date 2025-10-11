import {
  requireFields,
  httpError,
  assertAllowed,
  sendCookie,
} from "../utility/httpUtility.js";
import {
  get_students_by_course,
  get_teacher_by_course,
  get_user,
  get_users,
  delete_user,
  update_role,
  update_avatar,
} from "../service/userService.js";
import logger from "../utility/logger.js";

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

const updateAvatar = async (req, res, next) => {
  try {
    const { id } = req.user;
    const file = req.file;

    if (!file) {
      httpError(400, "No file found");
    }

    logger.debug("1");
    const { accessToken, refreshToken, role, username, avatar } =
      await update_avatar(id, file);

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Profile avatar updated",
      accessToken,
      role,
      avatar,
      username,
    });
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    if (role !== "undefined") {
      httpError(409, "The user already has a role");
    }

    requireFields(["role"], req.body);
    const { role: userRole } = req.body;

    assertAllowed(role, ["student", "teacher", "assistant"]);

    const {
      accessToken,
      refreshToken,
      role: userrole,
      username,
      avatar,
    } = await update_role(id, userRole);

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Role updated",
      accessToken,
      userrole,
      avatar,
      username,
    });
  } catch (err) {
    next(err);
  }
};

export {
  updateUser,
  updateRole,
  updateAvatar,
  deleteUser,
  getStudentsByCourse,
  getTeacherByCourse,
  getUser,
};
