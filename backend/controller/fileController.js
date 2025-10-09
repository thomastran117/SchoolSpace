import path from "path";
import fs from "fs/promises";
import mime from "mime-types";
import logger from "../utility/logger.js";
import { uploadFile, getFile, deleteFile } from "../service/fileService.js";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

export const serveFile = async (req, res) => {
  const { type, fileName } = req.params;

  try {
    const filePath = path.join(UPLOADS_DIR, type, fileName);

    if (!filePath.startsWith(UPLOADS_DIR)) {
      return res.status(400).json({ error: "Invalid file path" });
    }

    await fs.access(filePath);

    const contentType = mime.lookup(fileName) || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.sendFile(filePath);
  } catch (err) {
    logger.error(`File fetch failed: ${err.message}`);
    res.status(404).json({ error: "File not found" });
  }
};

export const handleUpload = async (req, res) => {
  const { type } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const result = await uploadFile(file.buffer, file.originalname, type);
    res.status(201).json({ message: "File uploaded", ...result });
  } catch (err) {
    logger.error(`Upload failed: ${err.message}`);
    res.status(500).json({ error: "File upload failed" });
  }
};

export const handleDelete = async (req, res) => {
  const { type, fileName } = req.params;

  try {
    await deleteFile(fileName, type);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    logger.error(`Delete failed: ${err.message}`);
    res.status(500).json({ error: "File delete failed" });
  }
};
