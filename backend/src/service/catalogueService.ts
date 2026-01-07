import type { Term } from "../generated/prisma/enums";
import type { CatalogueModel as Catalogue } from "../generated/prisma/models/Catalogue";
import type { CatalogueRepository } from "../repository/catalogueRepository";
import { httpError } from "../utility/httpUtility";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";

const NOT_FOUND = "__NF__";

class CatalogueService extends BaseService {
  private readonly cacheService: CacheService;
  private readonly catalogueRepository: CatalogueRepository;

  private static readonly CACHE_NAMESPACE = "catalogue:v1";

  private static readonly LIST_TTL = 300;
  private static readonly SEARCH_TTL = 120;
  private static readonly DETAIL_TTL = 600;
  private static readonly NOT_FOUND_TTL = 60;

  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 15;
  private static readonly MAX_LIMIT = 50;

  private catalogueVersion?: number;

  constructor(
    cacheService: CacheService,
    catalogueRepository: CatalogueRepository
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
    const version = await this.cacheService.increment("catalogue:version");
    this.catalogueVersion = version;
  }

  private normalize(value?: string | number | boolean | null): string {
    if (value === null || value === undefined) return "any";
    if (typeof value === "string") return value.trim().toLowerCase();
    return String(value);
  }

  private key(
    ...parts: (string | number | boolean | undefined | null)[]
  ): string {
    return [
      CatalogueService.CACHE_NAMESPACE,
      ...parts.map((p) => this.normalize(p)),
    ].join(":");
  }

  public async createCourseTemplate(
    courseName: string,
    description: string,
    courseCode: string,
    term: Term,
    available = true
  ): Promise<Catalogue> {
    const existing =
      await this.catalogueRepository.findByCourseCode(courseCode);
    if (existing) httpError(409, "Course template already exists");

    const course = await this.catalogueRepository.create({
      courseName,
      description,
      courseCode,
      term,
      available,
    });

    await this.bumpCatalogueVersion();
    return this.toSafe(course);
  }

  public async getCourseTemplates(
    term?: Term,
    available?: boolean,
    search?: string,
    page = CatalogueService.DEFAULT_PAGE,
    limit = CatalogueService.DEFAULT_LIMIT
  ) {
    page = Math.max(1, page);
    limit = Math.min(CatalogueService.MAX_LIMIT, Math.max(1, limit));

    const filter: Record<string, unknown> = {};
    if (term) filter.term = term;
    if (available !== undefined) filter.available = available;
    if (search) filter.search = search;

    const version = await this.getCatalogueVersion();

    const cacheKey = this.key(
      "v",
      version,
      "list",
      term,
      available,
      search,
      page,
      limit
    );
    const ttl = search
      ? CatalogueService.SEARCH_TTL
      : CatalogueService.LIST_TTL;

    return this.cacheService.getOrSet(cacheKey, ttl, async () => {
      const { results, total } =
        await this.catalogueRepository.findAllWithFilters(filter, page, limit);

      return {
        data: this.toSafeArray(results),
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    });
  }

  public async getCourseTemplateById(id: number): Promise<Catalogue> {
    const cacheKey = this.key("id", id);

    const cached = await this.cacheService.get<Catalogue | typeof NOT_FOUND>(
      cacheKey
    );

    if (cached === NOT_FOUND) httpError(404, "Course not found");
    if (cached) return cached;

    const course = await this.catalogueRepository.findById(id);
    if (!course) {
      await this.cacheService.set(
        cacheKey,
        NOT_FOUND,
        CatalogueService.NOT_FOUND_TTL
      );
      httpError(404, "Course not found");
    }

    const safe = this.toSafe(course);
    await this.cacheService.set(cacheKey, safe, CatalogueService.DETAIL_TTL);

    return safe;
  }

  public async updateCourseTemplate(
    id: number,
    updates: Partial<Catalogue>
  ): Promise<Catalogue> {
    const course = await this.catalogueRepository.update(id, updates);
    if (!course) httpError(404, "Course template not found");

    await this.cacheService.delete(this.key("id", id));
    await this.bumpCatalogueVersion();

    return this.toSafe(course);
  }

  public async deleteCourseTemplate(id: number): Promise<boolean> {
    await this.catalogueRepository.delete(id);

    await this.cacheService.delete(this.key("id", id));
    await this.bumpCatalogueVersion();

    return true;
  }
}

export { CatalogueService };
