import type { ICatalogue, Term } from "../templates/mongoTemplate";
import { CatalogueModel } from "../templates/mongoTemplate";
import { BaseRepository } from "./baseRepository";

class CatalogueRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: string): Promise<ICatalogue | null> {
    return this.executeAsync(async () => {
      return await CatalogueModel.findById(id).lean();
    });
  }

  public async findByCourseCode(
    course_code: string,
  ): Promise<ICatalogue | null> {
    return this.executeAsync(async () => {
      return await CatalogueModel.findOne({ course_code }).lean();
    });
  }

  public async findAllWithFilters(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
  ): Promise<{ results: ICatalogue[]; total: number }> {
    return this.executeAsync(async () => {
      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        CatalogueModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CatalogueModel.countDocuments(filter),
      ]);

      return { results, total };
    });
  }

  public async create(
    course_name: string,
    description: string,
    course_code: string,
    term: Term,
    available: boolean = true,
  ): Promise<ICatalogue> {
    return this.executeAsync(async () => {
      const course = await CatalogueModel.create({
        course_name,
        description,
        course_code,
        term,
        available,
      });

      return course.toObject();
    });
  }

  public async update(
    id: string,
    updates: Partial<ICatalogue>,
  ): Promise<ICatalogue | null> {
    return this.executeAsync(async () => {
      return await CatalogueModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
        lean: true,
      });
    });
  }

  public async delete(id: string): Promise<ICatalogue | null> {
    return this.executeAsync(async () => {
      return await CatalogueModel.findByIdAndDelete(id).lean();
    });
  }
}

export { CatalogueRepository };
