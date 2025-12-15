import { CatalogueRepository } from "../repository/catalogueRepository";
import type { ICatalogue, Term } from "../templates/mongoTemplate";
import { httpError } from "../utility/httpUtility";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";

class CatalogueService extends BaseService {
  private readonly cacheService: CacheService;
  private readonly catalogueRepository: CatalogueRepository;
  private readonly ttl = 300;

  constructor(
    cacheService: CacheService,
    catalogueRepository: CatalogueRepository,
  ) {
    super();
    this.cacheService = cacheService;
    this.catalogueRepository = catalogueRepository;
  }

  public async createCourseTemplate(
    course_name: string,
    description: string,
    course_code: string,
    term: Term,
    available: boolean = true,
  ): Promise<ICatalogue> {
    try {
      const existing =
        await this.catalogueRepository.findByCourseCode(course_code);
      if (existing) httpError(409, "Course template already exists");

      const course = await this.catalogueRepository.create(
        course_name,
        description,
        course_code,
        term,
        available,
      );

      await this.cacheService.delete("catalogue:all");

      return this.toSafe(course);
    } catch (err) {
      throw httpError(500, `Failed to create course template: ${String(err)}`);
    }
  }

  public async getCourseTemplates(
    term?: Term,
    available?: boolean,
    search?: string,
    page = 1,
    limit = 15,
  ) {
    try {
      const filter: Record<string, unknown> = {};
      if (term) filter.term = term;
      if (available !== undefined) filter.available = available;
      if (search) {
        filter.$or = [
          { course_name: { $regex: search, $options: "i" } },
          { course_code: { $regex: search, $options: "i" } },
        ];
      }

      const cacheKey = `catalogue:filter:${term ?? "all"}:${
        available ?? "any"
      }:${search ?? "none"}:${page}:${limit}`;

      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;

      const { results, total } =
        await this.catalogueRepository.findAllWithFilters(filter, page, limit);

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
      throw httpError(500, `Failed to fetch course templates: ${String(err)}`);
    }
  }

  public async getCourseTemplateById(id: string): Promise<ICatalogue> {
    const cacheKey = `catalogue:id:${id}`;

    const cached = await this.cacheService.get<ICatalogue>(cacheKey);
    if (cached) return cached;

    const course = await this.catalogueRepository.findById(id);
    if (!course) httpError(404, "Course not found");

    const safe = this.toSafe(course);
    await this.cacheService.set(cacheKey, safe, this.ttl);

    return safe;
  }

  public async updateCourseTemplate(
    id: string,
    updates: Partial<ICatalogue>,
  ): Promise<ICatalogue> {
    try {
      const course = await this.catalogueRepository.update(id, updates);
      if (!course) httpError(404, "Course template not found");

      const safe = this.toSafe(course);

      await this.cacheService.delete(`catalogue:id:${id}`);
      await this.cacheService.delete("catalogue:all");

      return safe;
    } catch (err) {
      throw httpError(500, `Failed to update course template: ${String(err)}`);
    }
  }

  public async deleteCourseTemplate(id: string): Promise<boolean> {
    try {
      const result = await this.catalogueRepository.delete(id);
      if (!result) httpError(404, "Course template not found");

      await this.cacheService.delete(`catalogue:id:${id}`);
      await this.cacheService.delete("catalogue:all");

      return true;
    } catch (err) {
      throw httpError(500, `Failed to delete course: ${String(err)}`);
    }
  }
}

export { CatalogueService };
