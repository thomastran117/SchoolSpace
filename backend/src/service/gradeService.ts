import type { GradeModel as Grade } from "../generated/prisma/models/Grade";
import type { GradeRepository } from "../repository/gradeRepository";
import { HttpError, httpError } from "../utility/httpUtility";
import logger from "../utility/logger";
import { BaseService } from "./baseService";
import type { CacheService } from "./cacheService";
import type { CourseService } from "./courseService";
import type { UserService } from "./userService";

class GradeService extends BaseService {
  private readonly gradeRepository: GradeRepository;
  private readonly cacheService: CacheService;
  private readonly courseService: CourseService;
  private readonly userService: UserService;

  private readonly FINAL_TTL = 15;
  private readonly LIST_TTL = 60;

  constructor(
    gradeRepository: GradeRepository,
    cacheService: CacheService,
    courseService: CourseService,
    userService: UserService
  ) {
    super();
    this.gradeRepository = gradeRepository;
    this.cacheService = cacheService;
    this.courseService = courseService;
    this.userService = userService;
  }

  private key(...parts: (string | number)[]): string {
    return ["grade", ...parts].join(":");
  }

  private finalKey(courseId: number, userId: number) {
    return this.key("final", courseId, userId);
  }

  private validateScore(obtained: number, total: number) {
    if (obtained < 0 || obtained > total) {
      httpError(400, "Obtained score cannot exceed total score");
    }
  }

  private async validateWeights(
    courseId: number,
    userId: number,
    incomingWeight: number,
    excludeId?: number
  ) {
    const { results } = await this.gradeRepository.getUserGradesInCourse(
      courseId,
      userId
    );

    const totalWeight = results
      .filter((g) => !g.isFinalGrade && g.id !== excludeId)
      .reduce((sum, g) => sum + g.weight, 0);

    if (totalWeight + incomingWeight > 100) {
      httpError(400, "Total grade weight exceeds 100%");
    }
  }

  private async ensureSingleFinalGrade(courseId: number, userId: number) {
    const existing = await this.getCachedFinalGrade(courseId, userId);
    if (existing) {
      httpError(
        409,
        "Final grade already exists for this student in this course"
      );
    }
  }

  private preventFinalDelete(grade: Grade) {
    if (grade.isFinalGrade) httpError(403, "Final grades cannot be deleted");
  }

  private async autoFinalize(courseId: number, userId: number) {
    const { results } = await this.gradeRepository.getUserGradesInCourse(
      courseId,
      userId
    );

    const nonFinal = results.filter((g) => !g.isFinalGrade);
    const totalWeight = nonFinal.reduce((s, g) => s + g.weight, 0);

    if (totalWeight === 100) {
      const finalScore =
        nonFinal.reduce((s, g) => s + (g.obtained / g.total) * g.weight, 0) /
        100;

      await this.gradeRepository.upsertForTarget({
        courseId,
        userId,
        name: "Final Grade",
        weight: 100,
        obtained: finalScore * 100,
        total: 100,
        isFinalGrade: true,
      });
    }
  }

  private async getCachedFinalGrade(courseId: number, userId: number) {
    const cacheKey = this.finalKey(courseId, userId);
    const cached = await this.cacheService.get<Grade | null>(cacheKey);
    if (cached !== undefined) return cached;

    const final = await this.gradeRepository.getFinalGrade(courseId, userId);
    await this.cacheService.set(cacheKey, final ?? null, this.FINAL_TTL);
    return final;
  }

  public async getGradeById(id: number): Promise<Grade> {
    const grade = await this.gradeRepository.findById(id);
    if (!grade) httpError(404, "Grade not found");
    return this.toSafe(grade);
  }

  public async getGradesForCourse(courseId: number, page = 1, limit = 50) {
    await this.courseService.getCourseById(courseId);

    const { results, total } = await this.gradeRepository.findAll({
      courseId,
      page,
      limit,
    });

    return {
      data: this.toSafeArray(results),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async getGradesForUser(courseId: number, userId: number) {
    await Promise.all([
      this.courseService.getCourseById(courseId),
      this.userService.getUser(userId),
    ]);

    const cacheKey = this.key("list", courseId, userId);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const { results } = await this.gradeRepository.getUserGradesInCourse(
      courseId,
      userId
    );

    const safe = this.toSafeArray(results);
    await this.cacheService.set(cacheKey, safe, this.LIST_TTL);
    return safe;
  }

  public async upsertGrade(input: {
    courseId: number;
    userId: number;
    assignmentId?: number;
    testId?: string;
    quizId?: string;
    name: string;
    weight: number;
    obtained: number;
    total: number;
    isFinalGrade?: boolean;
  }): Promise<Grade> {
    const [_, __, final] = await Promise.all([
      this.courseService.getCourseById(input.courseId),
      this.userService.getUser(input.userId),
      this.getCachedFinalGrade(input.courseId, input.userId),
    ]);

    if (final)
      httpError(423, "Grades are locked because final grade is already issued");

    this.validateScore(input.obtained, input.total);
    await this.validateWeights(input.courseId, input.userId, input.weight);

    if (input.isFinalGrade) {
      await this.ensureSingleFinalGrade(input.courseId, input.userId);
    }

    const grade = await this.gradeRepository.upsertForTarget(input);

    await Promise.all([
      this.autoFinalize(input.courseId, input.userId),
      this.cacheService.delete(this.key("list", input.courseId, input.userId)),
      this.cacheService.delete(this.finalKey(input.courseId, input.userId)),
    ]);

    return this.toSafe(grade);
  }

  public async deleteGrade(id: number): Promise<boolean> {
    const grade = await this.gradeRepository.findById(id);
    if (!grade) httpError(404, "Grade not found");

    this.preventFinalDelete(grade);
    return this.gradeRepository.delete(id);
  }
}

export { GradeService };
