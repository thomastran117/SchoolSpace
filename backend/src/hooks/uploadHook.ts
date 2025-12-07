import type { MultipartFile } from "@fastify/multipart";
import type { FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import sanitize from "sanitize-filename";
import { httpError } from "../utility/httpUtility";
import logger from "../utility/logger";

const allowedMimeTypes = ["image/jpeg", "image/png"];
const allowedExtensions = [".jpg", ".jpeg", ".png"];
const maxSize = 2 * 1024 * 1024;

export async function safeUploadAvatar(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const file: MultipartFile | undefined = await req.file();

  if (!file) {
    throw httpError(400, "Missing file. Expected field name 'avatar'");
  }

  if (file.file.bytesRead > maxSize) {
    throw httpError(400, "File too large. Max file size is 2MB.");
  }

  const ext = path.extname(file.filename).toLowerCase();
  const mime = file.mimetype;

  const validMime = allowedMimeTypes.includes(mime);
  const validExt = allowedExtensions.includes(ext);

  if (!validMime || !validExt) {
    logger.warn(
      `Rejected file: mimetype=${mime}, ext=${ext}, name=${file.filename}`,
    );

    throw httpError(
      400,
      "Only JPG and PNG files with correct extensions are allowed",
    );
  }

  file.filename = sanitize(file.filename);

  (req as any).validatedFile = file;
}
