import type { CacheService } from "./cacheService";

class GradeService {
  private readonly cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  public async createGrade() {
    return;
  }

  public async updateGrade() {
    return;
  }

  public async deleteGrade() {
    return;
  }

  public async getGrade() {
    return;
  }

  public async getAllGrades() {
    return;
  }

  public async getAllGradesForCourse() {
    return;
  }

  public async getAllGradeForUser() {
    return;
  }

  public async getTranscript() {
    return;
  }
}

export { GradeService };
