import type {
  CreateCatalogueDto,
  QueryCatalogueDto,
  UpdateCatalogueDto,
} from "@dto/catalogueSchema";
import { ForbiddenError } from "@error/forbiddenError";
import { HttpError } from "@error/httpError";
import { InternalServerError } from "@error/internalServerError";
import type { UserPayload } from "@models/token";
import type { CatalogueService } from "@service/catalogueService";
import logger from "@utility/logger";
import type { FastifyReply, FastifyRequest } from "fastify";

class CatalogueController {
  private readonly catalogueService: CatalogueService;

  constructor(dependencies: { catalogueService: CatalogueService }) {
    this.catalogueService = dependencies.catalogueService;

    this.createCourseTemplate = this.createCourseTemplate.bind(this);
    this.updateCourseTemplate = this.updateCourseTemplate.bind(this);
    this.deleteCourseTemplate = this.deleteCourseTemplate.bind(this);
    this.getCourseTemplate = this.getCourseTemplate.bind(this);
    this.getCourseTemplates = this.getCourseTemplates.bind(this);
  }

  private parsePositiveInt(
    value: string | undefined,
    defaultValue: number
  ): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
  }

  private ensureAdmin(req: FastifyRequest) {
    const { role } = req.user as UserPayload;
    if (role !== "admin") {
      throw new ForbiddenError({
        message: "User lacks the permission to perform this action",
      });
    }
  }

  public async createCourseTemplate(
    req: FastifyRequest<{ Body: CreateCatalogueDto }>,
    reply: FastifyReply
  ) {
    try {
      this.ensureAdmin(req);

      const result = await this.catalogueService.createCourseTemplate(
        req.body.course_name,
        req.body.description,
        req.body.course_code,
        req.body.term as any,
        req.body.available
      );

      return reply.code(200).send({
        message: "Course template created successfully.",
        data: result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CatalogueController] createCourseTemplate failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async updateCourseTemplate(
    req: FastifyRequest<{ Body: UpdateCatalogueDto; Params: { id: number } }>,
    reply: FastifyReply
  ) {
    try {
      this.ensureAdmin(req);

      const updates: Partial<UpdateCatalogueDto> = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (value !== undefined) {
          (updates as any)[key] = value;
        }
      }

      const result = await this.catalogueService.updateCourseTemplate(
        req.params.id,
        updates as any
      );

      return reply.code(200).send({
        message: "Course template updated successfully.",
        data: result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CatalogueController] updateCourseTemplate failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async deleteCourseTemplate(
    req: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
  ) {
    try {
      this.ensureAdmin(req);

      await this.catalogueService.deleteCourseTemplate(req.params.id);

      return reply.code(200).send({
        message: "Course template deleted successfully.",
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CatalogueController] deleteCourseTemplate failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getCourseTemplate(
    req: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
  ) {
    try {
      const course = await this.catalogueService.getCourseTemplateById(
        req.params.id
      );

      return reply.code(200).send({
        message: "Course template fetched successfully.",
        data: course,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CatalogueController] getCourseTemplate failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getCourseTemplates(
    req: FastifyRequest<{ Querystring: QueryCatalogueDto }>,
    reply: FastifyReply
  ) {
    try {
      const page = this.parsePositiveInt(req.query.page, 1);
      const limit = this.parsePositiveInt(req.query.limit, 15);

      const result = await this.catalogueService.getCourseTemplates(
        req.query.term as any,
        req.query.available,
        req.query.search,
        page,
        limit
      );

      return reply.code(200).send({
        message: "Courses retrieved successfully.",
        ...result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CatalogueController] getCourseTemplates failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }
}

export { CatalogueController };
export default CatalogueController;
