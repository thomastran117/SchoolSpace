import path from "path";
import mime from "mime-types";
import { uploadFile, getFile, deleteFile } from "../src/service/fileService.js";
import logger from "../src/utility/logger.js";

export const handleUpload = async (req, res) => {
  const { type } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const result = await uploadFile(file.buffer, file.originalname, type);
    res.status(201).json({ message: "File uploaded successfully", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const serveFile = async (req, res) => {
  const { type, fileName } = req.params;

  try {
    const { file, filePath } = await getFile(type, fileName);
    const contentType = mime.lookup(fileName) || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.sendFile(filePath);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const handleDelete = async (req, res) => {
  const { type, fileName } = req.params;

  try {
    await deleteFile(type, fileName);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
