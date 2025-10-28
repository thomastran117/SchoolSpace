/**
 * @file fileRoute.ts
 * @description
 * Express router for file handling (upload, retrieval, deletion).
 *
 * @module route
 * @version 1.0.0
 * @auth Thomas
 */

import express, { Router } from "express";
import multer from "multer";
import {
  serveFile,
  handleUpload,
  handleDelete,
} from "../../toconvert/fileController";

const router: Router = express.Router();

// Use in-memory storage for temporary file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.get("/:type/:fileName", serveFile);

export default router;
