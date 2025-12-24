import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import type { GetFileResult, UploadResult } from "../models/file";
import { HttpError, httpError } from "../utility/httpUtility";
import logger from "../utility/logger";

const UPLOADS_DIR = path.resolve(__dirname, "../../../uploads");

class FileService {
  constructor() {
    this.init().catch((err) =>
      logger.error(
        `[FileService:init] Initialization failed: ${err.stack || err}`
      )
    );
  }

  public async uploadFile(
    buffer: Buffer,
    originalName = "file.bin",
    type = "general"
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
        return {
          fileName,
          filePath,
          publicUrl: `/files/${type}/${fileName}`,
          isDuplicate: true,
        };
      } catch {
        // not found → normal
      }

      await fs.writeFile(filePath, buffer);

      return {
        fileName,
        filePath,
        publicUrl: `/files/${type}/${fileName}`,
        isDuplicate: false,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(`[FileService] uploadFile failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async getFile(type: string, fileName: string): Promise<GetFileResult> {
    try {
      const filePath = path.join(UPLOADS_DIR, type, fileName);
      const file = await fs.readFile(filePath);
      return { file, filePath };
    } catch (err: any) {
      if (err.code === "ENOENT") {
        httpError(404, "File not found");
      }

      if (err instanceof HttpError) throw err;

      logger.error(`[FileService] getFile failed: ${err?.message ?? err}`);
      httpError(500, "Internal server error");
    }
  }

  public async deleteFile(type: string, fileNameOrUrl: string): Promise<void> {
    let fileName = fileNameOrUrl;

    try {
      const prefix = `/files/${type}/`;
      if (fileName.startsWith(prefix)) fileName = fileName.replace(prefix, "");

      if (fileName.includes("..") || fileName.includes("/")) {
        httpError(400, "Invalid file name");
      }

      const filePath = path.join(UPLOADS_DIR, type, fileName);
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code === "ENOENT") httpError(404, "File not found");

      logger.error(`[FileService] deleteFile failed: ${err?.message ?? err}`);

      httpError(500, "Internal server error");
    }
  }

  private async init(): Promise<void> {
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
      } catch (err: any) {
        logger.error(`[FileService] init failed: ${err?.message ?? err}`);
        httpError(500, "Internal server error");
      }
    }
  }

  private hashBuffer(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }
}

export { FileService };
