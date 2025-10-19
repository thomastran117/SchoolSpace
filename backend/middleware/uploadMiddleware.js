import multer from "multer";
import path from "path";
import sanitize from "sanitize-filename";
import logger from "../utility/logger.js";

const allowedMimeTypes = ["image/jpeg", "image/png"];
const maxSize = 2 * 1024 * 1024; // 2 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    logger.warn(`Rejected file type: ${file.mimetype}`);
    return cb(new Error("Only JPG and PNG files are allowed"));
  }

  file.originalname = sanitize(file.originalname);
  cb(null, true);
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});
