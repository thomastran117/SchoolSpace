import type { CacheService } from "./cacheService";
import type { FileService } from "./fileService";

class AssignmentService {
  private readonly cacheService: CacheService;
  private readonly fileService: FileService;

  constructor(cacheService: CacheService, fileService: FileService) {
    this.cacheService = cacheService;
    this.fileService = fileService;
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
