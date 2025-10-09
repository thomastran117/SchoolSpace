import express from "express";
import multer from "multer";
import {
  serveFile,
  handleUpload,
  handleDelete,
} from "../controller/fileController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/:type/upload", upload.single("file"), handleUpload);

router.get("/:type/:fileName", serveFile);

router.delete("/:type/:fileName", handleDelete);

export default router;
