/**
 * @file fileService.ts
 * @description
 * Provides low-level file management for uploads, retrieval, and deletion.
 *
 * - Automatically creates the `uploads` directory on startup.
 * - Hashes uploaded files for deduplication.
 * - Returns standardized metadata for uploaded files.
 * - Logs every action (create/read/delete).
 *
 * @module service
 * @version 1.0.0
 * @auth Thomas
 */

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import logger from "../utility/logger";
import type { UploadResult, GetFileResult } from "../models/file";

const UPLOADS_DIR = path.resolve(__dirname, "../../../uploads");

class FileService {
  constructor() {
    this.init().catch((err) =>
      logger.error(`[FileService] Initialization failed: ${err.message}`),
    );
  }

  public async uploadFile(
    buffer: Buffer,
    originalName = "file.bin",
    type = "general",
  ): Promise<UploadResult> {
    try {
      const dir = path.join(UPLOADS_DIR, type);
      await fs.mkdir(dir, { recursive: true });

      const ext = path.extname(originalName).toLowerCase() || ".bin";
      const hash = this.hashBuffer(buffer);
      const fileName = `${hash}${ext}`;
      const filePath = path.join(dir, fileName);

      try {
        await fs.access(filePath);
        logger.info(`Duplicate detected (${type}): ${fileName}`);
        return {
          fileName,
          filePath,
          publicUrl: `/files/${type}/${fileName}`,
          isDuplicate: true,
        };
      } catch {
        // File does not exist yet — proceed to write
      }

      await fs.writeFile(filePath, buffer);
      logger.info(`File uploaded (${type}): ${fileName}`);

      return {
        fileName,
        filePath,
        publicUrl: `/files/${type}/${fileName}`,
        isDuplicate: false,
      };
    } catch (err: any) {
      logger.error(`Upload failed: ${err.message}`);
      throw new Error("File upload failed");
    }
  }

  public async getFile(type: string, fileName: string): Promise<GetFileResult> {
    try {
      const filePath = path.join(UPLOADS_DIR, type, fileName);
      const file = await fs.readFile(filePath);
      return { file, filePath };
    } catch (err: any) {
      logger.error(`Failed to read ${type}/${fileName}: ${err.message}`);
      throw new Error("File not found");
    }
  }

  public async deleteFile(type: string, fileNameOrUrl: string): Promise<void> {
    let fileName = fileNameOrUrl;

    try {
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
    } catch (err: any) {
      if (err.code === "ENOENT") {
        logger.warn(`Tried to delete missing file: ${fileNameOrUrl}`);
        throw new Error("File not found");
      }
      logger.error(`Delete failed: ${err.message}`);
      throw new Error("File delete failed");
    }
  }

  private async init(): Promise<void> {
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        logger.info(`Uploads directory created at: ${UPLOADS_DIR}`);
      } catch (err: any) {
        logger.error(`Failed to create uploads directory: ${err.message}`);
      }
    }
  }

  private hashBuffer(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }
}

export { FileService };
