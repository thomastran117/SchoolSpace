import type { MultipartFile } from "@fastify/multipart";
import type { CourseRepository } from "../repository/courseRepository";
import type { ICourse } from "../templates/courseTemplate";
import { httpError } from "../utility/httpUtility";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";
import { CatalogueService } from "./catalogueService";
import type { FileService } from "./fileService";
import { UserService } from "./userService";
import logger from "../utility/logger";
import crypto from "crypto";

const NOT_FOUND = "__NOT_FOUND__";

const COURSE_HOT_THRESHOLD = 20;
const LIST_HOT_THRESHOLD = 15;
const HOT_WINDOW_SEC = 60;

class CourseService extends BaseService {
  private readonly cacheService: CacheService;
  private readonly courseRepository: CourseRepository;
  private readonly catalogueService?: CatalogueService;
  private readonly fileService?: FileService;
  private readonly userService?: UserService;

  private readonly LIST_TTL = 300;
  private readonly DETAIL_TTL = 600;
  private readonly NEGATIVE_TTL = 60;

  private readonly HOT_DETAIL_TTL = 1800;
  private readonly HOT_LIST_TTL = 120;

  private courseVersion?: number;

  constructor(
    courseRepository: CourseRepository,
    cacheService: CacheService,
    userService: UserService,
    catalogueService: CatalogueService,
    fileService: FileService,
  ) {
    super();
    this.cacheService = cacheService;
    this.courseRepository = courseRepository;
    this.catalogueService = catalogueService;
    this.fileService = fileService;
    this.userService = userService;
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

  private async trackHotCourse(id: string): Promise<boolean> {
    const key = `course:hot:${id}`;
    const count = await this.cacheService.increment(
      key,
      1,
      HOT_WINDOW_SEC,
    );

    if (count === COURSE_HOT_THRESHOLD) {
      logger.info(`[CourseService] Course ${id} became HOT`);
      return true;
    }

    return count > COURSE_HOT_THRESHOLD;
  }

  private async trackHotList(cacheKey: string): Promise<boolean> {
    const key = `course:list:hot:${this.hashKey(cacheKey)}`;
    const count = await this.cacheService.increment(
      key,
      1,
      HOT_WINDOW_SEC,
    );

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
    teacherId?: string,
    year?: number,
    page = 1,
    limit = 15,
  ) {
    const filter: Record<string, unknown> = {};
    if (teacherId) filter.teacher_id = teacherId;
    if (year !== undefined) filter.year = year;

    const version = await this.getVersion();

    const cacheKey = this.key(
      "v",
      version,
      "list",
      teacherId ?? "any",
      year ?? "any",
      page,
      limit,
    );

    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const hasLock = await this.acquireSoftLock(cacheKey);
    if (!hasLock) {
      await new Promise((r) => setTimeout(r, 50));
      const retry = await this.cacheService.get(cacheKey);
      if (retry) return retry;
    }

    try {
      const { results, total } =
        await this.courseRepository.findAllWithFilters(
          filter,
          page,
          limit,
        );

      const response = {
        data: this.toSafeArray(results),
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };

      const isHot = await this.trackHotList(cacheKey);

      await this.cacheService.set(
        cacheKey,
        response,
        isHot ? this.HOT_LIST_TTL : this.LIST_TTL,
      );

      return response;
    } catch (err) {
      await this.releaseSoftLock(cacheKey);
      throw err;
    }
  }

  public async getCourseById(id: string): Promise<ICourse> {
    const cacheKey = this.key("id", id);

    const cached = await this.cacheService.get<ICourse | typeof NOT_FOUND>(
      cacheKey,
    );

    if (cached === NOT_FOUND) {
      httpError(404, "Course not found");
    }

    if (cached) {
      await this.trackHotCourse(id);
      return cached;
    }

    const hasLock = await this.acquireSoftLock(cacheKey);
    if (!hasLock) {
      await new Promise((r) => setTimeout(r, 50));
      const retry = await this.cacheService.get<ICourse>(cacheKey);
      if (retry) return retry;
    }

    try {
      const course = await this.courseRepository.findById(id);
      if (!course) {
        await this.cacheService.set(
          cacheKey,
          NOT_FOUND,
          this.NEGATIVE_TTL,
        );
        httpError(404, "Course not found");
      }

      const safe = this.toSafe(course);
      const isHot = await this.trackHotCourse(id);

      await this.cacheService.set(
        cacheKey,
        safe,
        isHot ? this.HOT_DETAIL_TTL : this.DETAIL_TTL,
      );

      return safe;
    } catch (err) {
      await this.releaseSoftLock(cacheKey);
      throw err;
    }
  }

  public async createCourse(
    catalogueId: string,
    teacherId: string,
    year: number,
    image: MultipartFile,
  ): Promise<ICourse> {
    if (!this.fileService || !this.userService || !this.catalogueService)
      httpError(503, "Service not ready");

    await this.userService.getUser(teacherId);
    await this.catalogueService.getCourseTemplateById(catalogueId);

    const buffer = await image.toBuffer();
    const { publicUrl } = await this.fileService.uploadFile(
      buffer,
      image.filename,
      "course",
    );

    const course = await this.courseRepository.create(
      catalogueId,
      teacherId,
      year,
      publicUrl,
    );

    await this.bumpVersion();
    return this.toSafe(course);
  }

  public async updateCourse(
    id: string,
    updates: Partial<ICourse>,
    image?: MultipartFile,
  ): Promise<ICourse> {
    if (!this.fileService) httpError(503, "Service not ready");

    const existing = await this.courseRepository.findById(id);
    if (!existing) httpError(404, "Course not found");

    if (image) {
      const buffer = await image.toBuffer();
      const { publicUrl } = await this.fileService.uploadFile(
        buffer,
        image.filename,
        "course",
      );
      updates.image_url = publicUrl;
    }

    const updated = await this.courseRepository.update(id, updates);
    if (!updated) httpError(404, "Course not found after update");

    await this.bumpVersion();
    await this.cacheService.delete(this.key("id", id));

    return this.toSafe(updated);
  }

  public async deleteCourse(id: string): Promise<boolean> {
    const result = await this.courseRepository.delete(id);
    if (!result) httpError(404, "Course not found");

    await this.bumpVersion();
    await this.cacheService.delete(this.key("id", id));

    return true;
  }
}

export { CourseService };
