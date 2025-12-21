import type { MultipartFile } from "@fastify/multipart";
import type { CourseRepository } from "../repository/courseRepository";
import type { ICourse } from "../templates/mongoTemplate";
import { httpError } from "../utility/httpUtility";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";
import { CatalogueService } from "./catalogueService";
import type { FileService } from "./fileService";
import { UserService } from "./userService";

const NOT_FOUND = "__NOT_FOUND__";

class CourseService extends BaseService {
  private readonly cacheService: CacheService;
  private readonly courseRepository: CourseRepository;
  private readonly catalogueService?: CatalogueService;
  private readonly fileService?: FileService;
  private readonly userService?: UserService;

  private readonly LIST_TTL = 300;
  private readonly TEACHER_TTL = 300;
  private readonly DETAIL_TTL = 600;
  private readonly NEGATIVE_TTL = 60;

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

  private async getVersion(): Promise<number> {
    if (this.courseVersion === undefined) {
      this.courseVersion =
        (await this.cacheService.get<number>("course:version")) ?? 1;
    }
    return this.courseVersion;
  }

  private async bumpVersion(): Promise<void> {
    await this.cacheService.increment("course:version");
  }

  private async markHot(id: string): Promise<void> {
    await this.cacheService.increment(`course:hot:${id}`, 1, 60);
  }

  public async createCourse(
    catalogueId: string,
    teacherId: number,
    year: number,
    image: MultipartFile,
  ): Promise<ICourse> {
    try {
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
    } catch (err) {
      throw httpError(500, `Failed to create course: ${String(err)}`);
    }
  }

  public async getCourses(
    teacherId?: number,
    year?: number,
    page = 1,
    limit = 15,
  ) {
    try {
      const filter: Record<string, unknown> = {};
      if (teacherId !== undefined) filter.teacher_id = teacherId;
      if (year !== undefined) filter.year = year;

      const version = await this.getVersion();

      const cacheKey = this.key(
        "v",
        version,
        "filter",
        teacherId ?? "any",
        year ?? "any",
        page,
        limit,
      );

      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;

      const { results, total } = await this.courseRepository.findAllWithFilters(
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

      await this.cacheService.set(cacheKey, response, this.LIST_TTL);
      return response;
    } catch (err) {
      throw httpError(500, `Failed to fetch courses: ${String(err)}`);
    }
  }

  public async getCourseById(id: string): Promise<ICourse> {
    const cacheKey = this.key("id", id);

    const cached = await this.cacheService.get<ICourse | typeof NOT_FOUND>(
      cacheKey,
    );

    if (cached === NOT_FOUND) httpError(404, "Course not found");
    if (cached) {
      await this.markHot(id);
      return cached;
    }

    const course = await this.courseRepository.findById(id);
    if (!course) {
      await this.cacheService.set(cacheKey, NOT_FOUND, this.NEGATIVE_TTL);
      httpError(404, "Course not found");
    }

    const safe = this.toSafe(course);
    await this.cacheService.set(cacheKey, safe, this.DETAIL_TTL);
    await this.markHot(id);

    return safe;
  }

  public async getCoursesByTeacher(
    teacherId: number,
    year?: number,
  ): Promise<ICourse[]> {
    if (!this.userService) httpError(503, "Service not ready");

    const version = await this.getVersion();

    const cacheKey = this.key(
      "v",
      version,
      "teacher",
      teacherId,
      year ?? "any",
    );

    const cached = await this.cacheService.get<ICourse[]>(cacheKey);
    if (cached) return cached;

    await this.userService.getUser(teacherId);

    const courses = await this.courseRepository.findByTeacher(teacherId, year);

    const safe = this.toSafeArray(courses);
    await this.cacheService.set(cacheKey, safe, this.TEACHER_TTL);
    return safe;
  }

  public async updateCourse(
    id: string,
    updates: Partial<ICourse>,
    image?: MultipartFile,
  ): Promise<ICourse> {
    try {
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
    } catch (err) {
      throw httpError(500, `Failed to update course: ${String(err)}`);
    }
  }

  public async deleteCourse(id: string): Promise<boolean> {
    try {
      if (!this.fileService) httpError(503, "Service not ready");

      const result = await this.courseRepository.delete(id);
      if (!result) httpError(404, "Course not found");

      await this.bumpVersion();
      await this.cacheService.delete(this.key("id", id));

      return true;
    } catch (err) {
      throw httpError(500, `Failed to delete course: ${String(err)}`);
    }
  }
}

export { CourseService };
