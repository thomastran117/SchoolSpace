import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
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

export const uploadFile = async (buffer, originalName, type = "general") => {
  try {
    const dir = path.join(UPLOADS_DIR, type);
    await fs.mkdir(dir, { recursive: true });

    const ext = path.extname(originalName) || "";
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(dir, fileName);

    await fs.writeFile(filePath, buffer);
    logger.info(`File uploaded (${type}): ${fileName}`);

    return {
      fileName,
      filePath,
      publicUrl: `/api/files/${type}/${fileName}`,
    };
  } catch (err) {
    logger.error(`Upload failed: ${err.message}`);
    throw new Error("File upload failed");
  }
};

export const getFile = async (type, fileName) => {
  try {
    const filePath = path.join(UPLOADS_DIR, type, fileName);
    const file = await fs.readFile(filePath);
    return { file, filePath };
  } catch (err) {
    logger.error(`Failed to read ${type}/${fileName}: ${err.message}`);
    throw new Error("File not found");
  }
};

export const deleteFile = async (type, fileName) => {
  try {
    const filePath = path.join(UPLOADS_DIR, type, fileName);
    await fs.unlink(filePath);
    logger.info(`Deleted file: ${fileName}`);
  } catch (err) {
    if (err.code === "ENOENT") {
      logger.warn(`Tried to delete missing file: ${fileName}`);
      throw new Error("File not found");
    }
    logger.error(`Delete failed: ${err.message}`);
    throw new Error("File delete failed");
  }
};
