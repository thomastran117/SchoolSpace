import { CatalogueRepository } from "../repository/catalogueRepository";
import type { ICatalogue, Term } from "../templates/mongoTemplate";
import { httpError } from "../utility/httpUtility";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";

class CatalogueService extends BaseService {
  private readonly cache: CacheService;
  private readonly repo: CatalogueRepository;
  private readonly ttl = 300;

  constructor(cacheService: CacheService, repo: CatalogueRepository) {
    super();
    this.cache = cacheService;
    this.repo = repo;
  }

  public async createCourseTemplate(
    course_name: string,
    description: string,
    course_code: string,
    term: Term,
    available: boolean = true,
  ): Promise<ICatalogue> {
    try {
      const existing = await this.repo.findByCourseCode(course_code);
      if (existing) httpError(409, "Course template already exists");

      const course = await this.repo.create(
        course_name,
        description,
        course_code,
        term,
        available,
      );

      await this.cache.delete("catalogue:all");
      await this.cache.deletePattern("catalogue:filter:*");

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

      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;

      const { results, total } = await this.repo.findAllWithFilters(
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

      await this.cache.set(cacheKey, response, this.ttl);
      return response;
    } catch (err) {
      throw httpError(500, `Failed to fetch course templates: ${String(err)}`);
    }
  }

  public async getCourseTemplateById(id: string): Promise<ICatalogue> {
    const cacheKey = `catalogue:id:${id}`;

    const cached = await this.cache.get<ICatalogue>(cacheKey);
    if (cached) return cached;

    const course = await this.repo.findById(id);
    if (!course) httpError(404, "Course not found");

    const safe = this.toSafe(course);
    await this.cache.set(cacheKey, safe, this.ttl);

    return safe;
  }

  public async updateCourseTemplate(
    id: string,
    updates: Partial<ICatalogue>,
  ): Promise<ICatalogue> {
    try {
      const course = await this.repo.update(id, updates);
      if (!course) httpError(404, "Course template not found");

      const safe = this.toSafe(course);

      await this.cache.delete(`catalogue:id:${id}`);
      await this.cache.deletePattern("catalogue:filter:*");
      await this.cache.delete("catalogue:all");

      return safe;
    } catch (err) {
      throw httpError(500, `Failed to update course template: ${String(err)}`);
    }
  }

  public async deleteCourseTemplate(id: string): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      if (!result) httpError(404, "Course template not found");

      await this.cache.delete(`catalogue:id:${id}`);
      await this.cache.deletePattern("catalogue:filter:*");
      await this.cache.delete("catalogue:all");

      return true;
    } catch (err) {
      throw httpError(500, `Failed to delete course: ${String(err)}`);
    }
  }
}

export { CatalogueService };
