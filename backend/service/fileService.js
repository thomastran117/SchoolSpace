const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utility/logger");

const PUBLIC_DIR = path.join(__dirname, "../public");

(async () => {
  try {
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    logger.info(`Public directory ready at: ${PUBLIC_DIR}`);
  } catch (err) {
    logger.error(`Failed to create public directory: ${err.message}`);
  }
})();

const uploadFile = async (buffer, originalName) => {
  try {
    const ext = path.extname(originalName) || "";
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(PUBLIC_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    logger.info(`File uploaded: ${fileName}`);

    return {
      fileName,
      filePath,
      publicUrl: `/public/${fileName}`,
    };
  } catch (err) {
    logger.error(`File upload failed: ${err.message}`);
    throw err;
  }
};

const getFile = async (fileName) => {
  try {
    const filePath = path.join(PUBLIC_DIR, fileName);
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
    const filePath = path.join(PUBLIC_DIR, fileName);
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

module.exports = { getFile, deleteFile, uploadFile };
