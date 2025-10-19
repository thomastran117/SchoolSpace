import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import logger from "../utility/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

(async () => {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      logger.info(`Uploads directory created at: ${UPLOADS_DIR}`);
    } catch (err) {
      logger.error(`Failed to create uploads directory: ${err.message}`);
    }
  }
})();

const hashBuffer = (buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");

const uploadFile = async (
  buffer,
  originalName = "file.bin",
  type = "general",
) => {
  try {
    const dir = path.join(UPLOADS_DIR, type);
    await fs.mkdir(dir, { recursive: true });

    const ext = path.extname(originalName) || ".bin";
    const hash = hashBuffer(buffer);
    const fileName = `${hash}${ext}`;
    const filePath = path.join(dir, fileName);

    try {
      await fs.access(filePath);
      logger.info(`Duplicate detected (${type}): ${fileName}`);
    } catch {
      await fs.writeFile(filePath, buffer);
      logger.info(`File uploaded (${type}): ${fileName}`);
    }

    return {
      fileName,
      filePath,
      publicUrl: `/files/${type}/${fileName}`,
    };
  } catch (err) {
    logger.error(`Upload failed: ${err.message}`);
    throw new Error("File upload failed");
  }
};

const getFile = async (type, fileName) => {
  try {
    const filePath = path.join(UPLOADS_DIR, type, fileName);
    const file = await fs.readFile(filePath);
    return { file, filePath };
  } catch (err) {
    logger.error(`Failed to read ${type}/${fileName}: ${err.message}`);
    throw new Error("File not found");
  }
};

const deleteFile = async (type, fileNameOrUrl) => {
  try {
    let fileName = fileNameOrUrl;
    const prefix = `/files/${type}/`;
    if (fileName.startsWith(prefix)) {
      fileName = fileName.replace(prefix, "");
    }

    if (fileName.includes("..") || fileName.includes("/")) {
      throw new Error("Invalid file name");
    }

    const filePath = path.join(UPLOADS_DIR, type, fileName);
    await fs.unlink(filePath);
    logger.info(`Deleted file: ${fileName}`);
  } catch (err) {
    if (err.code === "ENOENT") {
      logger.warn(`Tried to delete missing file: ${fileNameOrUrl}`);
      throw new Error("File not found");
    }
    logger.error(`Delete failed: ${err.message}`);
    throw new Error("File delete failed");
  }
};

export { uploadFile, getFile, deleteFile };
