import mongoose from "mongoose";
import type { ICourse } from "../templates/courseTemplate";
import { CourseModel } from "../templates/courseTemplate";
import { BaseRepository } from "./baseRepository";

class CourseRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: string): Promise<ICourse | null> {
    return this.executeAsync(
      (signal) =>
        CourseModel.findById(id)
          .populate("catalogue")
          .setOptions({ signal })
          .lean()
          .exec(),
      { deadlineMs: 800 },
    );
  }

  public async findByTeacher(
    teacherId: string,
    year?: number,
  ): Promise<ICourse[]> {
    return this.executeAsync(
      (signal) => {
        const filter: Record<string, any> = { teacher_id: teacherId };
        if (year) filter.year = year;

        return CourseModel.find(filter)
          .populate("catalogue")
          .sort({ createdAt: -1 })
          .setOptions({ signal })
          .lean()
          .exec();
      },
      { deadlineMs: 800 },
    );
  }

  public async findAllWithFilters(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
  ): Promise<{ results: ICourse[]; total: number }> {
    return this.executeAsync(
      async (signal) => {
        const skip = (page - 1) * limit;

        const [results, total] = await Promise.all([
          CourseModel.find(filter)
            .populate("catalogue")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .setOptions({ signal })
            .lean()
            .exec(),

          CourseModel.countDocuments(filter),
        ]);

        return { results, total };
      },
      { deadlineMs: 1200 },
    );
  }

  public async create(
    catalogueId: string,
    teacher_id: string,
    year: number,
    image_url?: string,
  ): Promise<ICourse> {
    return this.executeAsync(
      async () => {
        const course = new CourseModel({
          catalogue: new mongoose.Types.ObjectId(catalogueId),
          teacher_id: new mongoose.Types.ObjectId(teacher_id),
          year,
          image_url,
        });

        const saved = await course.save();
        return saved.toObject();
      },
      { deadlineMs: 1000 },
    );
  }

  public async update(
    id: string,
    updates: Partial<ICourse>,
  ): Promise<ICourse | null> {
    return this.executeAsync(
      (signal) =>
        CourseModel.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        })
          .populate("catalogue")
          .setOptions({ signal })
          .lean()
          .exec(),
      { deadlineMs: 800 },
    );
  }

  public async delete(id: string): Promise<ICourse | null> {
    return this.executeAsync(
      (signal) =>
        CourseModel.findByIdAndDelete(id)
          .setOptions({ signal })
          .lean()
          .exec(),
      { deadlineMs: 800 },
    );
  }

  public async countImages(imageUrl: string): Promise<number> {
    return this.executeAsync(
      () => CourseModel.countDocuments({ image_url: imageUrl }),
      { deadlineMs: 600 },
    );
  }
}

export { CourseRepository };
