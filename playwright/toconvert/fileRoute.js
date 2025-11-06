"use strict";
/**
 * @file fileRoute.ts
 * @description
 * Express router for file handling (upload, retrieval, deletion).
 *
 * @module route
 * @version 1.0.0
 * @auth Thomas
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fileController_1 = require("../../toconvert/fileController");
const router = express_1.default.Router();
// Use in-memory storage for temporary file uploads
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get("/:type/:fileName", fileController_1.serveFile);
exports.default = router;
