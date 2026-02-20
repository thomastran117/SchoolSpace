import type { CacheService } from "@service/cacheService";
import type { FileService } from "@service/fileService";

class AssignmentService {
  private readonly cacheService: CacheService;
  private readonly fileService: FileService;

  constructor(dependencies: {
    cacheService: CacheService;
    fileService: FileService;
  }) {
    this.cacheService = dependencies.cacheService;
    this.fileService = dependencies.fileService;
  }

  public async createAssignment() {
    return;
  }

  public async updateAssignment() {
    return;
  }

  public async deleteAssignment() {
    return;
  }

  public async getAssignment() {
    return;
  }

  public async getAllAssignments() {
    return;
  }

  public async getAllAssignmentsByCourse() {
    return;
  }
}

export { AssignmentService };
