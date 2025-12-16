import type { MultipartFile } from "@fastify/multipart";
import type { CourseRepository } from "../repository/courseRepository";
import type { ICourse } from "../templates/mongoTemplate";
import { httpError } from "../utility/httpUtility";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";
import { CatalogueService } from "./catalogueService";
import type { FileService } from "./fileService";
import { UserService } from "./userService";

class CourseService extends BaseService {
  private readonly cacheService: CacheService;
  private readonly catalogueService?: CatalogueService;
  private readonly fileService?: FileService;
  private readonly userService?: UserService;
  private readonly courseRepository: CourseRepository;
  private readonly ttl = 300;

  constructor(
    courseRepository: CourseRepository,
    cacheService: CacheService,
    userService: UserService,
    catalogueService: CatalogueService,
    fileService: FileService,
  ) {
    super();
    this.cacheService = cacheService;
    this.fileService = fileService;
    this.catalogueService = catalogueService;
    this.courseRepository = courseRepository;
    this.userService = userService;
  }

  public async createCourse(
    catalogueId: string,
    teacherId: number,
    year: number,
    image: MultipartFile,
  ): Promise<ICourse> {
    try {
      if (!this.fileService || !this.userService || !this.catalogueService)
        httpError(503, "Service is not ready to serve this route");

      const user = await this.userService.getUser(teacherId);
      if (!user) httpError(400, `User with the ID ${teacherId} does not exist`);

      const catalogue =
        await this.catalogueService.getCourseTemplateById(catalogueId);
      if (!catalogue)
        httpError(400, `Catalogue with the ID ${catalogueId} does not exist`);

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

      await this.cacheService.delete("course:all");

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

      const cacheKey = `course:filter:${teacherId ?? "any"}:${
        year ?? "any"
      }:${page}:${limit}`;

      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;

      const { results, total } = await this.courseRepository.findAllWithFilters(
        filter,
        page,
        limit,
      );

      const safeResults = this.toSafeArray(results);
      const totalPages = Math.ceil(total / limit);

      const response = {
        data: safeResults,
        total,
        totalPages,
        currentPage: page,
      };

      await this.cacheService.set(cacheKey, response, this.ttl);
      return response;
    } catch (err) {
      throw httpError(500, `Failed to fetch courses: ${String(err)}`);
    }
  }

  public async getCourseById(id: string): Promise<ICourse> {
    const cacheKey = `course:id:${id}`;

    const cached = await this.cacheService.get<ICourse>(cacheKey);
    if (cached) return cached;

    const course = await this.courseRepository.findById(id);
    if (!course) httpError(404, "Course not found");

    const safe = this.toSafe(course);
    await this.cacheService.set(cacheKey, safe, this.ttl);

    return safe;
  }

  public async getCoursesByTeacher(
    teacherId: number,
    year?: number,
  ): Promise<ICourse[]> {
    if (!this.userService)
      httpError(503, "Service is not ready to serve this route");

    const cacheKey = `course:teacher:${teacherId}:${year ?? "any"}`;

    const cached = await this.cacheService.get<ICourse[]>(cacheKey);
    if (cached) return cached;

    const user = await this.userService.getUser(teacherId);
    if (!user) httpError(400, `User with the ID ${teacherId} does not exist`);

    const courses = await this.courseRepository.findByTeacher(teacherId, year);
    const safe = this.toSafeArray(courses);

    await this.cacheService.set(cacheKey, safe, this.ttl);
    return safe;
  }

  public async updateCourse(
    id: string,
    updates: Partial<ICourse>,
    image?: MultipartFile,
  ): Promise<ICourse> {
    try {
      if (!this.fileService)
        httpError(503, "Service is not ready to serve this route");

      const existing = await this.courseRepository.findById(id);
      if (!existing) httpError(404, "Course not found");

      const oldImage = existing.image_url;

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

      if (
        oldImage &&
        updates.image_url &&
        updates.image_url !== oldImage &&
        (await this.courseRepository.countImages(oldImage)) <= 1
      ) {
        await this.fileService.deleteFile("course", oldImage);
      }

      const safe = this.toSafe(updated);

      await Promise.all([
        this.cacheService.delete(`course:id:${id}`),
        this.cacheService.delete("course:all"),
      ]);

      return safe;
    } catch (err) {
      throw httpError(500, `Failed to update course: ${String(err)}`);
    }
  }

  public async deleteCourse(id: string): Promise<boolean> {
    try {
      if (!this.fileService)
        httpError(503, "Service is not ready to serve this route");

      const result = await this.courseRepository.delete(id);
      if (!result) httpError(404, "Course not found");

      await this.cacheService.delete(`course:id:${id}`);
      await this.cacheService.delete("course:all");

      return true;
    } catch (err) {
      throw httpError(500, `Failed to delete course: ${String(err)}`);
    }
  }
}

export { CourseService };
