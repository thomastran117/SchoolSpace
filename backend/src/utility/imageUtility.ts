/**
 * @file imageUtility.ts
 * @description
 * Utility for validating and sanitizing uploaded profile images.
 *
 * - Validates MIME type and integrity using `file-type`.
 * - Resizes images that exceed maximum dimensions.
 * - Re-encodes to optimized JPEG using Sharp.
 * - Generates a unique, sanitized filename.
 *
 * @module utility
 * @version 1.0.0
 * @auth Thomas
 */

import { httpError } from "../utility/httpUtility";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";
import type { Express } from "express";

const MAX_WIDTH = 2048;
const MAX_HEIGHT = 2048;

export interface SanitizedImageResult {
  fileName: string;
  sanitizedBuffer: Buffer;
}

/**
 * Validates and sanitizes a user profile image.
 *
 * @param file - Uploaded file object from Multer (must contain `buffer`).
 * @returns {Promise<SanitizedImageResult>} Sanitized file metadata and buffer.
 * @throws {HttpError} If file is missing, invalid, or corrupted.
 */
export async function sanitizeProfileImage(
  file?: Express.Multer.File
): Promise<SanitizedImageResult> {
  if (!file) {
    httpError(400, "No file uploaded");
  }

  const detected = await fileTypeFromBuffer(file!.buffer);
  if (!detected || !["image/jpeg", "image/png"].includes(detected.mime)) {
    httpError(400, "Invalid or corrupted image file");
  }

  const meta = await sharp(file!.buffer).metadata();

  let imagePipeline = sharp(file!.buffer).withMetadata();

  if ((meta.width ?? 0) > MAX_WIDTH || (meta.height ?? 0) > MAX_HEIGHT) {
    imagePipeline = imagePipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const sanitizedBuffer = await imagePipeline.jpeg({ quality: 85 }).toBuffer();
  const fileName = `${uuidv4()}.jpg`;

  return { fileName, sanitizedBuffer };
}

  /*
    if (meta.width > 2048 || meta.height > 2048) {
      httpError(400, "Image dimensions too large (max 2048x2048)");
    }

    const sanitizedBuffer = await sharp(file.buffer)
      .resize(512, 512, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();
    */