import type { MultipartFile } from "@fastify/multipart";
import type { FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import sanitize from "sanitize-filename";

import { BadRequestError } from "../error";
import logger from "../utility/logger";

type ImageUploadOptions = {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  fieldName?: string;
};

const DEFAULTS: Required<ImageUploadOptions> = {
  maxSize: 5 * 1024 * 1024, // 5MB default
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  fieldName: "file",
};

export function safeUploadImage(options?: ImageUploadOptions) {
  const config = { ...DEFAULTS, ...options };

  return async function (req: FastifyRequest, reply: FastifyReply) {
    const file: MultipartFile | undefined = await req.file();

    if (!file) {
      throw new BadRequestError({
        message: `Missing file. Expected field name '${config.fieldName}'`,
      });
    }

    if (file.file.bytesRead > config.maxSize) {
      throw new BadRequestError({
        message: `File too large. Max file size is ${Math.floor(config.maxSize / 1024 / 1024)}MB.`,
      });
    }

    const ext = path.extname(file.filename).toLowerCase();
    const mime = file.mimetype;

    const validMime = config.allowedMimeTypes.includes(mime);
    const validExt = config.allowedExtensions.includes(ext);

    if (!validMime || !validExt) {
      logger.warn(
        `Rejected image upload: mimetype=${mime}, ext=${ext}, name=${file.filename}`
      );

      throw new BadRequestError({
        message: `Invalid image format. Allowed: ${config.allowedExtensions.join(", ")}`,
      });
    }

    file.filename = sanitize(file.filename);

    (req as any).validatedFile = file;
  };
}

export const safeUploadAvatar = safeUploadImage({
  maxSize: 2 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png"],
  allowedExtensions: [".jpg", ".jpeg", ".png"],
  fieldName: "avatar",
});
