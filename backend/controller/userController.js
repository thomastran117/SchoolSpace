import {
  requireFields,
  httpError,
  assertAllowed,
  sendCookie,
} from "../utility/httpUtility.js";
import sharp from "sharp";
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
import sanitize from "sanitize-filename";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";

const maxWidth = 2048;
const maxHeight = 2048;

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

    if (!file) httpError(400, "No file uploaded");

    const detected = await fileTypeFromBuffer(file.buffer);
    if (!detected || !["image/jpeg", "image/png"].includes(detected.mime)) {
      httpError(400, "Invalid or corrupted image file");
    }

    const meta = await sharp(file.buffer).metadata();
    
    /*
    if (meta.width > 2048 || meta.height > 2048) {
      httpError(400, "Image dimensions too large (max 2048x2048)");
    }

    const sanitizedBuffer = await sharp(file.buffer)
      .resize(512, 512, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();
    */

  let imagePipeline = sharp(file.buffer).withMetadata();

  if (meta.width > maxWidth || meta.height > maxHeight) {
    imagePipeline = imagePipeline.resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const sanitizedBuffer = await imagePipeline
    .jpeg({ quality: 85 })
    .toBuffer();

    const fileName = `${uuidv4()}.jpg`;
    file.buffer = sanitizedBuffer;
    file.originalname = fileName;

    const { accessToken, refreshToken, role, username, avatar } =
      await update_avatar(id, file);

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
