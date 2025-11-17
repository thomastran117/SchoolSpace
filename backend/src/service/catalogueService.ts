import type { ICatalogue, Term } from "../templates/mongoTemplate";
import { CatalogueModel } from "../templates/mongoTemplate";
import { httpError } from "../utility/httpUtility";
import { BasicService } from "./basicService";
import type { CacheService } from "./cacheService";

class CatalogueService extends BasicService {
  private readonly cache: CacheService;
  private readonly ttl = 300;

  constructor(cacheService: CacheService) {
    super();
    this.cache = cacheService;
  }

  public async createCourseTemplate(
    course_name: string,
    description: string,
    course_code: string,
    term: Term,
    available: boolean = true,
  ): Promise<ICatalogue> {
    try {
      const existing = await CatalogueModel.findOne({ course_code }).lean();
      if (existing) httpError(409, "Course template already exists");

      const course = await CatalogueModel.create({
        course_name,
        description,
        course_code,
        term,
        available,
      });

      await this.cache.delete("catalogue:all");
      await this.cache.deletePattern("catalogue:filter:*");

      return this.toSafe(course.toObject());
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
  ): Promise<{
    data: ICatalogue[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
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

      const skip = (page - 1) * limit;

      const cacheKey = `catalogue:filter:${term ?? "all"}:${
        available ?? "any"
      }:${search ?? "none"}:${page}:${limit}`;

      const cached = await this.cache.get<{
        data: ICatalogue[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>(cacheKey);

      if (cached) return cached;

      const [results, total] = await Promise.all([
        CatalogueModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CatalogueModel.countDocuments(filter),
      ]);

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
      httpError(500, `Failed to fetch course templates: ${String(err)}`);
    }
  }

  public async getCourseTemplateById(id: string): Promise<ICatalogue> {
    const cacheKey = `catalogue:id:${id}`;

    const cached = await this.cache.get<ICatalogue>(cacheKey);
    if (cached) return cached;

    const course = await CatalogueModel.findById(id).lean();
    if (!course) httpError(404, "Course not found");

    const safe = this.toSafe(course);
    await this.cache.set(cacheKey, safe, this.ttl);

    return safe;
  }

  public async updateCourseTemplate(
    id: string,
    course_name?: string,
    description?: string,
    course_code?: string,
    term?: Term,
    available?: boolean,
  ): Promise<ICatalogue> {
    try {
      const updates: Partial<ICatalogue> = {};
      if (course_name) updates.course_name = course_name;
      if (description) updates.description = description;
      if (course_code) updates.course_code = course_code;
      if (term) updates.term = term;
      if (available !== undefined) updates.available = available;

      const course = await CatalogueModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
        lean: true,
      });

      if (!course) httpError(404, "Course template not found");

      const safe = this.toSafe(course);

      await this.cache.delete(`catalogue:id:${id}`);
      await this.cache.deletePattern("catalogue:filter:*");
      await this.cache.delete("catalogue:all");

      return safe;
    } catch (err) {
      httpError(500, `Failed to update course template: ${String(err)}`);
    }
  }

  public async deleteCourseTemplate(id: string): Promise<boolean> {
    try {
      const result = await CatalogueModel.findByIdAndDelete(id).lean();

      if (!result) httpError(404, "Course template not found");

      await this.cache.delete(`catalogue:id:${id}`);
      await this.cache.deletePattern("catalogue:filter:*");
      await this.cache.delete("catalogue:all");

      return true;
    } catch (err) {
      httpError(500, `Failed to delete course: ${String(err)}`);
    }
  }
}

export { CatalogueService };
