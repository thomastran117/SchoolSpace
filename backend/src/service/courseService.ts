import type { MultipartFile } from "@fastify/multipart";
import type { Prisma } from "@prisma/client";
import crypto from "crypto";

import { HttpError, InternalServerError, NotFoundError } from "../error";
import type { CourseFull, CourseListItem } from "../models/course";
import type { CourseRepository } from "../repository";
import logger from "../utility/logger";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";
import type { CatalogueService } from "./catalogueService";
import type { EnrollmentService } from "./enrollmentService";
import type { FileService } from "./fileService";
import type { UserService } from "./userService";

const NOT_FOUND = "__NOT_FOUND__";

const COURSE_HOT_THRESHOLD = 20;
const LIST_HOT_THRESHOLD = 15;
const HOT_WINDOW_SEC = 60;

class CourseService extends BaseService {
  private readonly cacheService: CacheService;
  private readonly courseRepository: CourseRepository;
  private readonly catalogueService: CatalogueService;
  private readonly fileService: FileService;
  private readonly userService: UserService;
  private readonly enrollmentService: EnrollmentService;

  private readonly LIST_TTL = 300;
  private readonly DETAIL_TTL = 600;
  private readonly NEGATIVE_TTL = 60;

  private readonly HOT_DETAIL_TTL = 1800;
  private readonly HOT_LIST_TTL = 120;

  private courseVersion?: number;

  constructor(dependencies: {
    courseRepository: CourseRepository;
    cacheService: CacheService;
    userService: UserService;
    catalogueService: CatalogueService;
    fileService: FileService;
    enrollmentService: EnrollmentService;
  }) {
    super();
    this.cacheService = dependencies.cacheService;
    this.courseRepository = dependencies.courseRepository;
    this.catalogueService = dependencies.catalogueService;
    this.fileService = dependencies.fileService;
    this.userService = dependencies.userService;
    this.enrollmentService = dependencies.enrollmentService;
  }

  private key(...parts: (string | number | boolean)[]): string {
    return ["course", ...parts].join(":");
  }

  private hashKey(key: string): string {
    return crypto.createHash("sha1").update(key).digest("hex");
  }

  private async getVersion(): Promise<number> {
    if (this.courseVersion === undefined) {
      this.courseVersion =
        (await this.cacheService.get<number>("course:version")) ?? 1;
    }
    return this.courseVersion;
  }

  private async bumpVersion(): Promise<void> {
    const next = await this.cacheService.increment("course:version");
    this.courseVersion = next;
  }

  private async trackHotCourse(id: number): Promise<boolean> {
    const key = `course:hot:${id}`;
    const count = await this.cacheService.increment(key, 1, HOT_WINDOW_SEC);

    if (count === COURSE_HOT_THRESHOLD) {
      logger.info(`[CourseService] Course ${id} became HOT`);
      return true;
    }
    return count > COURSE_HOT_THRESHOLD;
  }

  private async trackHotList(cacheKey: string): Promise<boolean> {
    const key = `course:list:hot:${this.hashKey(cacheKey)}`;
    const count = await this.cacheService.increment(key, 1, HOT_WINDOW_SEC);

    if (count === LIST_HOT_THRESHOLD) {
      logger.info(`[CourseService] Course list page became HOT ${cacheKey}`);
      return true;
    }
    return count > LIST_HOT_THRESHOLD;
  }

  private async acquireSoftLock(key: string): Promise<boolean> {
    return this.cacheService.setIfNotExists(`${key}:lock`, true, 5);
  }

  private async releaseSoftLock(key: string): Promise<void> {
    await this.cacheService.delete(`${key}:lock`);
  }

  public async getCourses(
    teacherId?: number,
    year?: number,
    page = 1,
    limit = 15
  ): Promise<{
    data: CourseListItem[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const filter: Record<string, unknown> = {};
      if (teacherId) filter.teacherId = teacherId;
      if (year !== undefined) filter.year = year;

      const version = await this.getVersion();
      const cacheKey = this.key(
        "v",
        version,
        "list",
        teacherId ?? "any",
        year ?? "any",
        page,
        limit
      );

      const cached = await this.cacheService.get<
        | {
            data: CourseListItem[];
            total: number;
            totalPages: number;
            currentPage: number;
          }
        | undefined
      >(cacheKey);
      if (cached) return cached;

      const hasLock = await this.acquireSoftLock(cacheKey);
      if (!hasLock) {
        await new Promise((r) => setTimeout(r, 50));
        const retry = await this.cacheService.get<typeof cached>(cacheKey);
        if (retry) return retry;
      }

      try {
        const { results, total } =
          await this.courseRepository.findAllWithFilters(filter, page, limit);

        const response = {
          data: results,
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        };

        const isHot = await this.trackHotList(cacheKey);
        await this.cacheService.set(
          cacheKey,
          response,
          isHot ? this.HOT_LIST_TTL : this.LIST_TTL
        );

        return response;
      } finally {
        await this.releaseSoftLock(cacheKey);
      }
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[CourseService] getCourses failed: ${err?.message ?? err}`);
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getCourseById(id: number): Promise<CourseFull> {
    try {
      const cacheKey = this.key("id", id);

      const cached = await this.cacheService.get<CourseFull | typeof NOT_FOUND>(
        cacheKey
      );

      if (cached === NOT_FOUND)
        throw new NotFoundError({ message: "Course not found" });

      if (cached) {
        await this.trackHotCourse(id);
        return cached;
      }

      const hasLock = await this.acquireSoftLock(cacheKey);
      if (!hasLock) {
        await new Promise((r) => setTimeout(r, 50));
        const retry = await this.cacheService.get<CourseFull>(cacheKey);
        if (retry) return retry;
      }

      try {
        const course = await this.courseRepository.findById(id);
        if (!course) {
          await this.cacheService.set(cacheKey, NOT_FOUND, this.NEGATIVE_TTL);
          throw new NotFoundError({ message: "Course not found" });
        }

        const isHot = await this.trackHotCourse(id);
        await this.cacheService.set(
          cacheKey,
          course,
          isHot ? this.HOT_DETAIL_TTL : this.DETAIL_TTL
        );

        return course;
      } finally {
        await this.releaseSoftLock(cacheKey);
      }
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[CourseService] getCourseById failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async createCourse(
    catalogueId: number,
    teacherId: number,
    year: number,
    section: string,
    image: MultipartFile
  ): Promise<CourseFull> {
    try {
      await Promise.all([
        this.userService.getUser(teacherId),
        this.catalogueService.getCourseTemplateById(catalogueId),
      ]);

      const buffer = await image.toBuffer();
      const { publicUrl } = await this.fileService.uploadFile(
        buffer,
        image.filename,
        "course"
      );

      const course = await this.courseRepository.create({
        catalogueId,
        teacherId,
        year,
        imageUrl: publicUrl,
        section,
      } as unknown as Prisma.CourseCreateInput);

      await this.bumpVersion();
      await this.cacheService.delete(this.key("id", course.id));
      return course;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[CourseService] createCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async updateCourse(
    id: number,
    updates: Prisma.CourseUpdateInput,
    image?: MultipartFile
  ): Promise<CourseFull> {
    try {
      const existing = await this.courseRepository.findById(id);
      if (!existing) throw new NotFoundError({ message: "Course not found" });

      if (image) {
        const buffer = await image.toBuffer();
        const { publicUrl } = await this.fileService.uploadFile(
          buffer,
          image.filename,
          "course"
        );
        (updates as any).imageUrl = publicUrl;
      }

      const updated = await this.courseRepository.update(id, updates);
      if (!updated) throw new NotFoundError({ message: "Course not found" });

      await this.bumpVersion();
      await this.cacheService.delete(this.key("id", id));

      return updated;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[CourseService] updateCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async deleteCourse(id: number): Promise<boolean> {
    try {
      const existing = await this.courseRepository.findById(id);
      if (!existing) throw new NotFoundError({ message: "Course not found" });

      await this.courseRepository.delete(id);

      await this.bumpVersion();
      await this.cacheService.delete(this.key("id", id));
      return true;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[CourseService] deleteCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async enrollCourse(courseId: number, userId: number) {
    try {
      await Promise.all([
        this.getCourseById(courseId),
        this.userService.getUser(userId),
      ]);

      const enrollment = await this.enrollmentService.enrollCourse(
        courseId,
        userId
      );
      await this.courseRepository.incrementCounter(
        courseId,
        "enrollmentNumber"
      );

      return enrollment;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[CourseService] enrollCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async enrollCourseUsingCode(code: string, userId: number) {
    try {
      await this.userService.getUser(userId);
      const { enrollment, courseId } =
        await this.enrollmentService.enrollCourseWithCode(code, userId);
      await this.courseRepository.incrementCounter(
        courseId,
        "enrollmentNumber"
      );
      return enrollment;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[CourseService] enrollCourseUsingCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async createEnrollmentCode(courseId: number) {
    try {
      await this.getCourseById(courseId);
      const code =
        await this.enrollmentService.generateEnrollmentCode(courseId);
      return code;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[CourseService] createEnrollmentCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async isUserEnrolledInCourse(courseId: number, userId: number){
    try {
      await Promise.all([
        this.getCourseById(courseId),
        this.userService.getUser(userId),
      ]);

      const enrollment = await this.enrollmentService.isEnrolled(courseId, userId);
      if (!enrollment) throw new NotFoundError({message: "User is not enrolled in this course"});
      return true;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[CourseService] isUserEnrolledInCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    } 
  }
}

export { CourseService };
