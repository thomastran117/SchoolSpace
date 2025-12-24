import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  CreateCourseDto,
  QueryCourseDto,
  UpdateCourseDto,
} from "../dto/courseSchema";
import type { CourseService } from "../service/courseService";
import { HttpError } from "../utility/httpUtility";
import { sanitizeProfileImage } from "../utility/imageUtility";
import logger from "../utility/logger";
import { BaseController } from "./baseController";

class CourseController extends BaseController {
  private readonly courseService: CourseService;

  constructor(courseService: CourseService) {
    super();
    this.courseService = courseService;
    this.getCourses = this.getCourses.bind(this);
    this.getCourse = this.getCourse.bind(this);
    this.createCourse = this.createCourse.bind(this);
    this.updateCourse = this.updateCourse.bind(this);
    this.deleteCourse = this.deleteCourse.bind(this);
  }

  public async getCourses(
    req: FastifyRequest<{ Querystring: QueryCourseDto }>,
    reply: FastifyReply,
  ) {
    try {
      const page = this.parsePositiveInt(req.query.page, 1);
      const limit = this.parsePositiveInt(req.query.limit, 15);

      const result = await this.courseService.getCourses(
        req.query.search,
        page,
        limit,
      );

      return reply.code(200).send({
        message: "Courses retrieved successfully.",
        ...result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] getCourses failed: ${err?.message ?? err}`,
      );
      throw new HttpError(500, "Internal server error");
    }
  }

  public async getCourse(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const course = await this.courseService.getCourseById(req.params.id);

      return reply.code(200).send({
        message: "Course fetched successfully.",
        data: course,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] createCourse failed: ${err?.message ?? err}`,
      );
      throw new HttpError(500, "Internal server error");
    }
  }

  public async createCourse(
    req: FastifyRequest<{ Body: CreateCourseDto }>,
    reply: FastifyReply,
  ) {
    try {
      this.ensureTeacher(req);

      const file = await req.file();
      let normalizedFile;
      if (file) {
        const { fileName, sanitizedBuffer } = await sanitizeProfileImage(file);

        const buffer = await file.toBuffer();

        normalizedFile = {
          buffer: sanitizedBuffer ?? buffer,
          originalname: fileName,
          mimetype: file.mimetype,
          size: file.file.bytesRead,
        };
      }

      const result = await this.courseService.createCourse(
        req.body.catalogue_id,
        req.user.id,
        req.body.year,
        normalizedFile as any,
      );

      return reply.code(200).send({
        message: "Course created successfully.",
        data: result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] createCourse failed: ${err?.message ?? err}`,
      );
      throw new HttpError(500, "Internal server error");
    }
  }

  public async updateCourse(
    req: FastifyRequest<{ Body: UpdateCourseDto; Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      this.ensureTeacher(req);

      const updates: Partial<UpdateCourseDto> = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (value !== undefined) {
          (updates as any)[key] = value;
        }
      }

      const result = await this.courseService.updateCourse(
        req.params.id,
        updates,
      );

      return reply.code(200).send({
        message: "Course updated successfully.",
        data: result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] updateCourse failed: ${err?.message ?? err}`,
      );
      throw new HttpError(500, "Internal server error");
    }
  }

  public async deleteCourse(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    try {
      this.ensureTeacher(req);

      await this.courseService.deleteCourse(req.params.id);

      return reply.code(200).send({
        message: "Course deleted successfully.",
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] deleteCourse failed: ${err?.message ?? err}`,
      );
      throw new HttpError(500, "Internal server error");
    }
  }
}

export { CourseController };
