import type { FastifyReply, FastifyRequest } from "fastify";

import type {
  CodeCourseDto,
  CreateCourseDto,
  EnrollCourseDto,
  QueryCourseDto,
  UpdateCourseDto,
} from "../dto/courseSchema";
import { HttpError, InternalServerError, NotImplementedError } from "../error";
import type { CourseService } from "../service/courseService";
import { sanitizeProfileImage } from "../utility/imageUtility";
import logger from "../utility/logger";
import { BaseController } from "./baseController";

class CourseController extends BaseController {
  private readonly courseService: CourseService;

  constructor(dependencies: { courseService: CourseService }) {
    super();
    this.courseService = dependencies.courseService;
  }

  public async getCourses(
    req: FastifyRequest<{ Querystring: QueryCourseDto }>,
    reply: FastifyReply
  ) {
    try {
      const teacherId = req.query.teacherId;

      const year = req.query.year ? this.parseInt(req.query.year) : undefined;

      const page = this.parsePositiveInt(req.query.page, 1);
      const limit = this.parsePositiveInt(req.query.limit, 15);

      const result = await this.courseService.getCourses(
        teacherId,
        year,
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
        `[CourseController] getCourses failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getCourse(
    req: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
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
        `[CourseController] createCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async createCourse(
    req: FastifyRequest<{ Body: CreateCourseDto }>,
    reply: FastifyReply
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
        req.body.section,
        normalizedFile as any
      );

      return reply.code(200).send({
        message: "Course created successfully.",
        data: result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] createCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async updateCourse(
    req: FastifyRequest<{ Body: UpdateCourseDto; Params: { id: number } }>,
    reply: FastifyReply
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
        updates
      );

      return reply.code(200).send({
        message: "Course updated successfully.",
        data: result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] updateCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async deleteCourse(
    req: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
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
        `[CourseController] deleteCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async unenrollStudent(
    req: FastifyRequest<{ Params: { id: number }; Body: EnrollCourseDto }>,
    reply: FastifyReply
  ) {
    try {
      this.ensureTeacher(req);

      const result = await this.courseService.unenrollCourse(
        req.params.id,
        req.body.userId
      );
      return reply.code(200).send({
        message: "User enrolled in course successfully.",
        result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] unenrollStudent failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async enrollStudent(
    req: FastifyRequest<{ Params: { id: number }; Body: EnrollCourseDto }>,
    reply: FastifyReply
  ) {
    try {
      this.ensureTeacher(req);
      const result = await this.courseService.enrollCourse(
        req.params.id,
        req.body.userId
      );
      return reply.code(200).send({
        message: "User enrolled in course successfully.",
        result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] enrollStudent failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async generateEnrollCode(
    req: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
  ) {
    try {
      this.ensureTeacher(req);

      const result = await this.courseService.createEnrollmentCode(
        req.params.id,
        req.user.id
      );
      return reply.code(200).send({
        message: "Enrollment code created successfully.",
        code: result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] generateEnrollCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async removeEnrollCode(
    req: FastifyRequest<{ Params: { id: number; code: string } }>,
    reply: FastifyReply
  ) {
    try {
      throw new NotImplementedError();
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] removeEnrollCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async enrollWithCode(
    req: FastifyRequest<{ Params: { id: number }; Body: CodeCourseDto }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.courseService.enrollCourseUsingCode(
        req.body.code,
        req.params.id
      );
      return reply.code(200).send({
        message: "Course enrolled successfully.",
        result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[CourseController] enrollWithCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }
}

export { CourseController };
