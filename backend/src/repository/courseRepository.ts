import { BaseRepository } from "./baseRepository";

class CourseRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CourseRepository] findById failed: ${err?.message ?? err}`,
      );
    }
  }

  public async findAll() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CourseRepository] findAll failed: ${err?.message ?? err}`,
      );
    }
  }

  public async create() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CourseRepository] create failed: ${err?.message ?? err}`,
      );
    }
  }

  public async update() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CourseRepository] update failed: ${err?.message ?? err}`,
      );
    }
  }

  public async delete() {
    try {
      return;
    } catch (err: any) {
      throw new Error(
        `[CourseRepository] delete failed: ${err?.message ?? err}`,
      );
    }
  }
}

export { CourseRepository };
