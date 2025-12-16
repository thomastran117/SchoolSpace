import type { ICourse } from "../templates/mongoTemplate";
import { CourseModel } from "../templates/mongoTemplate";
import { BaseRepository } from "./baseRepository";

class CourseRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: string): Promise<ICourse | null> {
    return this.executeAsync(async () => {
      return await CourseModel.findById(id).populate("catalogue").lean();
    });
  }

  public async findByTeacher(
    teacherId: number,
    year?: number,
  ): Promise<ICourse[]> {
    return this.executeAsync(async () => {
      const filter: any = { teacher_id: teacherId };
      if (year) filter.year = year;

      return await CourseModel.find(filter)
        .populate("catalogue")
        .sort({ createdAt: -1 })
        .lean();
    });
  }

  public async findAllWithFilters(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
  ): Promise<{ results: ICourse[]; total: number }> {
    return this.executeAsync(async () => {
      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        CourseModel.find(filter)
          .populate("catalogue")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CourseModel.countDocuments(filter),
      ]);

      return { results, total };
    });
  }

  public async create(
    catalogueId: string,
    teacher_id: number,
    year: number,
    image_url?: string,
  ): Promise<ICourse> {
    return this.executeAsync(async () => {
      const course = await CourseModel.create({
        catalogue: catalogueId,
        teacher_id,
        year,
        image_url,
      });

      return course.toObject();
    });
  }

  public async update(
    id: string,
    updates: Partial<ICourse>,
  ): Promise<ICourse | null> {
    return this.executeAsync(async () => {
      return await CourseModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
        lean: true,
      }).populate("catalogue");
    });
  }

  public async delete(id: string): Promise<ICourse | null> {
    return this.executeAsync(async () => {
      return await CourseModel.findByIdAndDelete(id).lean();
    });
  }

  public async countImages(imageUrl: string): Promise<number> {
    return this.executeAsync(async () => {
      return await CourseModel.countDocuments({ image_url: imageUrl });
    });
  }
}

export { CourseRepository };
