import type { FastifyReply, FastifyRequest } from "fastify";
import mime from "mime-types";

import type { FileParams } from "../dto/coreSchema";
import { BadRequestError, HttpError } from "../error/index";
import { InternalServerError } from "../error/internalServerError";
import type { FileService } from "../service/fileService";
import logger from "../utility/logger";

class FileController {
  private readonly fileService: FileService;

  constructor(dependencies: { fileService: FileService }) {
    this.fileService = dependencies.fileService;

    this.handleUpload = this.handleUpload.bind(this);
    this.handleFetch = this.handleFetch.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  public async handleUpload(
    req: FastifyRequest<{ Params: FileParams }>,
    reply: FastifyReply
  ) {
    try {
      const { type } = req.params;

      const file = await req.file();
      if (!file) throw new BadRequestError({ message: "Missing file." });

      const buffer = await file.toBuffer();

      const result = await this.fileService.uploadFile(
        buffer,
        file.filename,
        type
      );

      return reply.code(201).send({
        message: "File uploaded successfully",
        ...result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[FileController] handleUpload failed: ${err?.message ?? err}`
      );

      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async handleFetch(
    req: FastifyRequest<{ Params: FileParams }>,
    reply: FastifyReply
  ) {
    try {
      const { type, fileName } = req.params;
      if (!fileName)
        throw new BadRequestError({ message: "Missing file name." });

      const { filePath } = await this.fileService.getFile(type, fileName);

      const contentType = mime.lookup(fileName) || "application/octet-stream";

      return reply
        .type(contentType)
        .send(await import("fs").then((fs) => fs.createReadStream(filePath)));
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[FileController] handleFetch failed: ${err?.message ?? err}`
      );

      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async handleDelete(
    req: FastifyRequest<{ Params: FileParams }>,
    reply: FastifyReply
  ) {
    try {
      const { type, fileName } = req.params;
      if (!fileName)
        throw new BadRequestError({ message: "Missing file name." });

      await this.fileService.deleteFile(type, fileName);

      return reply.code(200).send({
        message: "File deleted successfully",
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[FileController] handleDelete failed: ${err?.message ?? err}`
      );

      throw new InternalServerError({ message: "Internal server error" });
    }
  }
}

export { FileController };
