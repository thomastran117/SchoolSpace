import mongo from "../resource/mongo";
import { CatalogueModel } from "../resource/schema_mongo";
import { httpError } from "../utility/httpUtility";
import type { ICatalogue, Term } from "../resource/schema_mongo";
import type { CacheService } from "./cacheService";
import logger from "../utility/logger";

export class CatalogueService {
  private readonly cache: CacheService;
  private readonly ttl = 300;

  constructor(cacheService: CacheService) {
    this.cache = cacheService;
  }

  async createCourse(
    course_name: string,
    description: string,
    course_code: string,
    term: Term,
    available: boolean = true,
  ): Promise<ICatalogue> {
    try {
      const existing = await CatalogueModel.findOne({ course_code });
      if (existing) throw httpError(409, "Course already exists");

      logger.info("here");
      const course = await CatalogueModel.create({
        course_name,
        description,
        course_code,
        term,
        available,
      });

      await this.cache.delete("catalogue:all");
      await this.cache.deletePattern("catalogue:filter:*");
      return course;
    } catch (err) {
      throw httpError(500, `Failed to create course: ${String(err)}`);
    }
  }

  async getCourses(
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
      const cacheKey = `catalogue:filter:${term ?? "all"}:${available ?? "any"}:${
        search ?? "none"
      }:${page}:${limit}`;

      const cached = await this.cache.get<{
        data: ICatalogue[];
        total: number;
        totalPages: number;
        currentPage: number;
      }>(cacheKey);

      if (cached) {
        return cached;
      }

      const [results, total] = await Promise.all([
        CatalogueModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CatalogueModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      const response = {
        data: results,
        total,
        totalPages,
        currentPage: page,
      };

      await this.cache.set(cacheKey, response, this.ttl);

      return response;
    } catch (err) {
      throw httpError(500, `Failed to fetch courses: ${String(err)}`);
    }
  }

  async getCourseById(id: number): Promise<ICatalogue> {
    const cacheKey = `catalogue:id:${id}`;

    const cached = await this.cache.get<ICatalogue>(cacheKey);
    if (cached) return cached;

    const course = await CatalogueModel.findOne({ id }).lean();
    if (!course) throw httpError(404, "Course not found");

    await this.cache.set(cacheKey, course, this.ttl);
    return course;
  }

  async updateCourse(
    id: number,
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

      const course = await CatalogueModel.findOneAndUpdate({ id }, updates, {
        new: true,
        runValidators: true,
      }).lean();

      if (!course) throw httpError(404, "Course not found");

      await this.cache.delete("catalogue:all");
      await this.cache.delete(`catalogue:id:${id}`);
      await this.cache.deletePattern("catalogue:filter:*");
      return course;
    } catch (err) {
      throw httpError(500, `Failed to update course: ${String(err)}`);
    }
  }

  async deleteCourse(id: number): Promise<boolean> {
    try {
      const result = await CatalogueModel.deleteOne({ id });
      if (!result.deletedCount) throw httpError(404, "Course not found");

      await this.cache.delete("catalogue:all");
      await this.cache.delete(`catalogue:id:${id}`);
      await this.cache.deletePattern("catalogue:filter:*");
      return true;
    } catch (err) {
      throw httpError(500, `Failed to delete course: ${String(err)}`);
    }
  }
}
