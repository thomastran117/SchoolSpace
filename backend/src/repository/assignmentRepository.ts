import { BaseRepository } from "./baseRepository";

class AssignmentRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async findById(id: string) {}

  public async findByCourse(id: string) {}

  public async create() {}

  public async update() {}

  public async delete() {}

  public async findAllWithFilters() {}
}

export { AssignmentRepository }