import {
  requireFields,
  httpError,
  assertAllowed,
  sendCookie,
  requiresAtLeastOneField,
} from "../src/utility/httpUtility.js";
import {
  delete_user,
  update_role,
  update_avatar,
  update_user,
  get_user,
} from "../src/service/userService.js";
import logger from "../src/utility/logger.js";
import { sanitizeProfileImage } from "../src/utility/imageUtility.js";
import {
  validateString,
  validateAlphaNumericString,
  validateAddress,
  validatePhone,
  optionalValidateId,
} from "../src/utility/validateUtility.js";

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
    const { id: userId } = req.user;
    const validatedId = optionalValidateId(req.params.id, "userId");

    const targetId = validatedId || userId;
    const user = await get_user(targetId);

    res.status(200).json({
      message: "User fetched",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const token = req.cookies.refreshToken;

    requiresAtLeastOneField(
      ["username", "name", "address", "school", "phone", "faculty"],
      req.body,
    );

    const { username, name, phone, address, faculty, school } = req.body;

    const sanitized = {
      username: validateAlphaNumericString(username, "Username", 20, 4),
      name: validateString(name, "Name", 30, 2),
      school: validateString(school, "School", 50),
      faculty: validateString(faculty, "Faculty", 30),
      phone: validatePhone(phone, "Phone"),
      address: validateAddress(address, "Address"),
    };

    const {
      accessToken,
      refreshToken,
      role,
      username: newUsername,
      avatar,
    } = await update_user(userId, ...Object.values(sanitized), token);

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Profile avatar updated successfully",
      accessToken,
      role,
      avatar,
      username: newUsername,
    });
  } catch (err) {
    next(err);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { id } = req.user;
    const file = req.file;
    const token = req.cookies.refreshToken;

    const { fileName, sanitizedBuffer } = await sanitizeProfileImage(file);
    file.buffer = sanitizedBuffer;
    file.originalname = fileName;

    const { accessToken, refreshToken, role, username, avatar } =
      await update_avatar(id, file, token);

    sendCookie(res, refreshToken);

    res.status(200).json({
      message: "Profile avatar updated successfully",
      accessToken,
      role,
      avatar,
      username,
    });
  } catch (err) {
    logger.error(`Avatar update failed: ${err.message}`);
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const token = req.cookies.refreshToken;
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
    } = await update_role(id, userRole, token);

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

const deleteUser = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    await delete_user(userId);
    res.status(200).json({ message: "User deleted." });
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
