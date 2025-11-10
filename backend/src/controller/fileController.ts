import mime from "mime-types";
import type { FileService } from "../service/fileService.js";
import type { Request, Response, NextFunction } from "express";
import { httpError } from "../utility/httpUtility";

class FileController {
  private readonly fileService: FileService;

  constructor(fileService: FileService) {
    this.fileService = fileService;
    this.handleUpload = this.handleUpload.bind(this);
    this.handleFetch = this.handleFetch.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  public async handleUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const file = req.file;
      if (!file) httpError(400, "Missing file");
      const result = await this.fileService.uploadFile(
        file.buffer,
        file.originalname,
        type,
      );
      res
        .status(201)
        .json({ message: "File uploaded successfully", ...result });
    } catch (err) {
      next(err);
    }
  }

  public async handleFetch(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, fileName } = req.params;
      const { file, filePath } = await this.fileService.getFile(type, fileName);
      const contentType = mime.lookup(fileName) || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  }
  public async handleDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, fileName } = req.params;
      await this.fileService.deleteFile(type, fileName);
      res.status(200).json({ message: "File deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}

export { FileController };
