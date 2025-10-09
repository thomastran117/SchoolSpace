import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import logger from "../utility/logger.js";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

(async () => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    logger.info(`Uploads directory ready at: ${UPLOADS_DIR}`);
  } catch (err) {
    logger.error(`Failed to create uploads directory: ${err.message}`);
  }
})();

const uploadFile = async (buffer, originalName) => {
  try {
    const ext = path.extname(originalName) || "";
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    logger.info(`File uploaded: ${fileName}`);

    return {
      fileName,
      filePath,
      publicUrl: `/uploads/${fileName}`,
    };
  } catch (err) {
    logger.error(`File upload failed: ${err.message}`);
    throw err;
  }
};

const getFile = async (fileName) => {
  try {
    const filePath = path.join(UPLOADS_DIR, fileName);
    const file = await fs.readFile(filePath);

    logger.info(`File read: ${fileName}`);
    return file;
  } catch (err) {
    logger.error(`Failed to read file "${fileName}": ${err.message}`);
    throw err;
  }
};

const deleteFile = async (fileName) => {
  try {
    const filePath = path.join(UPLOADS_DIR, fileName);
    await fs.unlink(filePath);
    logger.info(`File deleted: ${fileName}`);
  } catch (err) {
    if (err.code === "ENOENT") {
      logger.warn(`Tried to delete missing file: ${fileName}`);
    } else {
      logger.error(`Failed to delete file "${fileName}": ${err.message}`);
    }
    throw err;
  }
};

export { getFile, deleteFile, uploadFile };
