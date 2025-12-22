import mongoose from "mongoose";
import { BaseRepository } from "./baseRepository";
import { AssignmentModel, type IAssignment } from "../templates/assignmentTemplate";

interface AssignmentFilters {
  courseId?: string;
  dueBefore?: Date;
  dueAfter?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

class AssignmentRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: string): Promise<IAssignment | null> {
    return this.executeAsync(
      (signal) =>
        AssignmentModel.findById(id)
          .setOptions({ signal })
          .exec(),
      { deadlineMs: 800 },
    );
  }

  public async findByCourse(courseId: string): Promise<IAssignment[]> {
    return this.executeAsync(
      (signal) =>
        AssignmentModel.find({ course_id: courseId })
          .sort({ dueDate: 1 })
          .setOptions({ signal })
          .exec(),
      { deadlineMs: 800 },
    );
  }

  public async create(data: {
    course_id: string;
    name: string;
    description: string;
    file_url?: string;
    dueDate?: Date;
  }): Promise<IAssignment> {
    return this.executeAsync(
      async () => {
        const assignment = new AssignmentModel({
          ...data,
          course_id: new mongoose.Types.ObjectId(data.course_id),
        });

        return assignment.save();
      },
      { deadlineMs: 1000 },
    );
  }

  public async update(
    id: string,
    updates: Partial<
      Pick<IAssignment, "name" | "description" | "file_url" | "dueDate">
    >,
  ): Promise<IAssignment | null> {
    return this.executeAsync(
      (signal) =>
        AssignmentModel.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        })
          .setOptions({ signal })
          .exec(),
      { deadlineMs: 800 },
    );
  }

  public async delete(id: string): Promise<boolean> {
    return this.executeAsync(
      async () => {
        const res = await AssignmentModel.deleteOne({ _id: id });
        return res.deletedCount === 1;
      },
      { deadlineMs: 800 },
    );
  }

  public async findAllWithFilters(
    filters: AssignmentFilters,
  ): Promise<{
    data: IAssignment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      courseId,
      dueBefore,
      dueAfter,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const query: Record<string, any> = {};

    if (courseId) query.course_id = courseId;

    if (dueBefore || dueAfter) {
      query.dueDate = {};
      if (dueBefore) query.dueDate.$lte = dueBefore;
      if (dueAfter) query.dueDate.$gte = dueAfter;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    return this.executeAsync(
      async (signal) => {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
          AssignmentModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .setOptions({ signal })
            .exec(),

          AssignmentModel.countDocuments(query),
        ]);

        return { data, total, page, limit };
      },
      { deadlineMs: 1200 },
    );
  }
}

export { AssignmentRepository };
