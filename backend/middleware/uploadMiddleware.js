import multer from "multer";
import path from "path";
import sanitize from "sanitize-filename";
import logger from "../utility/logger.js";

const allowedMimeTypes = ["image/jpeg", "image/png"];
const allowedExtensions = [".jpg", ".jpeg", ".png"];
const maxSize = 2 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    const validMime = allowedMimeTypes.includes(mime);
    const validExt = allowedExtensions.includes(ext);

    if (!validMime || !validExt) {
      logger.warn(
        `Rejected file: mimetype=${mime}, ext=${ext}, name=${file.originalname}`,
      );
      return cb(
        new Error("Only JPG and PNG files with correct extensions are allowed"),
        false,
      );
    }

    file.originalname = sanitize(file.originalname);
    cb(null, true);
  } catch (err) {
    logger.error(`File filter error: ${err.message}`);
    cb(new Error("File validation failed"), false);
  }
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});
