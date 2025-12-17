import { CatalogueRepository } from "../repository/catalogueRepository";
import type { ICatalogue, Term } from "../templates/mongoTemplate";
import { httpError } from "../utility/httpUtility";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";

const NOT_FOUND = "__NOT_FOUND__";

class CatalogueService extends BaseService {
  private readonly cacheService: CacheService;
  private readonly catalogueRepository: CatalogueRepository;

  private readonly LIST_TTL = 300;
  private readonly SEARCH_TTL = 120;
  private readonly DETAIL_TTL = 600;

  private catalogueVersion?: number;

  constructor(
    cacheService: CacheService,
    catalogueRepository: CatalogueRepository,
  ) {
    super();
    this.cacheService = cacheService;
    this.catalogueRepository = catalogueRepository;
  }

  private async getCatalogueVersion(): Promise<number> {
    if (this.catalogueVersion === undefined) {
      this.catalogueVersion =
        (await this.cacheService.get<number>("catalogue:version")) ?? 1;
    }
    return this.catalogueVersion;
  }

  private async bumpCatalogueVersion(): Promise<void> {
    await this.cacheService.increment("catalogue:version");
  }

  private key(...parts: (string | number | boolean)[]): string {
    return ["catalogue", ...parts].join(":");
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

      await this.bumpCatalogueVersion();
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

      const version = await this.getCatalogueVersion();

      const cacheKey = this.key(
        "v",
        version,
        "filter",
        term ?? "all",
        available ?? "any",
        search ?? "none",
        page,
        limit,
      );

      const cached = await this.cacheService.get(cacheKey);
      if (cached) return cached;

      const { results, total } =
        await this.catalogueRepository.findAllWithFilters(filter, page, limit);

      const response = {
        data: this.toSafeArray(results),
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };

      const ttl = search ? this.SEARCH_TTL : this.LIST_TTL;
      await this.cacheService.set(cacheKey, response, ttl);

      return response;
    } catch (err) {
      throw httpError(500, `Failed to fetch course templates: ${String(err)}`);
    }
  }

  public async getCourseTemplateById(id: string): Promise<ICatalogue> {
    const cacheKey = this.key("id", id);

    const cached = await this.cacheService.get<ICatalogue | typeof NOT_FOUND>(
      cacheKey,
    );

    if (cached === NOT_FOUND) httpError(404, "Course not found");
    if (cached) return cached;

    const course = await this.catalogueRepository.findById(id);
    if (!course) {
      await this.cacheService.set(cacheKey, NOT_FOUND, 60);
      httpError(404, "Course not found");
    }

    const safe = this.toSafe(course);
    await this.cacheService.set(cacheKey, safe, this.DETAIL_TTL);

    return safe;
  }

  public async updateCourseTemplate(
    id: string,
    updates: Partial<ICatalogue>,
  ): Promise<ICatalogue> {
    try {
      const course = await this.catalogueRepository.update(id, updates);
      if (!course) httpError(404, "Course template not found");

      await this.cacheService.delete(this.key("id", id));
      await this.bumpCatalogueVersion();

      return this.toSafe(course);
    } catch (err) {
      throw httpError(500, `Failed to update course template: ${String(err)}`);
    }
  }

  public async deleteCourseTemplate(id: string): Promise<boolean> {
    try {
      const result = await this.catalogueRepository.delete(id);
      if (!result) httpError(404, "Course template not found");

      await this.cacheService.delete(this.key("id", id));
      await this.bumpCatalogueVersion();

      return true;
    } catch (err) {
      throw httpError(500, `Failed to delete course: ${String(err)}`);
    }
  }
}

export { CatalogueService };
