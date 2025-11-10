/**
 * @file fileUploadMiddleware.ts
 * @description
 * Safe Multer middleware for validating and sanitizing uploaded avatar images.
 *
 * - Accepts only JPEG and PNG formats
 * - Restricts file size to 2MB
 * - Sanitizes filenames to prevent path injection
 * - Gracefully handles missing or unexpected fields
 *
 * @module middleware
 * @version 1.1.0
 * @auth Thomas
 */

import type { FileFilterCallback } from "multer";
import multer from "multer";
import path from "path";
import sanitize from "sanitize-filename";
import type { Request, Response, NextFunction } from "express";
import logger from "../utility/logger";

const allowedMimeTypes = ["image/jpeg", "image/png"];
const allowedExtensions = [".jpg", ".jpeg", ".png"];
const maxSize = 2 * 1024 * 1024; // 2 MB
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
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
      );
    }

    file.originalname = sanitize(file.originalname);
    cb(null, true);
  } catch (err: any) {
    logger.error(`File filter error: ${err.message}`);
    cb(new Error("File validation failed"));
  }
};

const baseUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

export function safeUploadAvatar() {
  const upload = baseUpload.single("avatar");

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            error: "Unexpected field",
            message: "Expected file field name 'avatar'.",
          });
        }
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File too large",
            message: "Max file size is 2MB.",
          });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
}
