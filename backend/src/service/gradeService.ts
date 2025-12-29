import type { GradeRepository } from "../repository/gradeRepository";
import type { IGrade } from "../templates/gradeTemplate";
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

  private finalKey(courseId: string, userId: string) {
    return this.key("final", courseId, userId);
  }

  private validateScore(obtained: number, total: number) {
    if (obtained < 0 || obtained > total) {
      httpError(400, "Obtained score cannot exceed total score");
    }
  }

  private async validateWeights(
    courseId: string,
    userId: string,
    incomingWeight: number,
    excludeId?: string
  ) {
    const { results } = await this.gradeRepository.getUserGradesInCourse(
      courseId,
      userId
    );

    const totalWeight = results
      .filter((g) => !g.isFinalGrade && (g._id as any).toString() !== excludeId)
      .reduce((sum, g) => sum + g.weight, 0);

    if (totalWeight + incomingWeight > 100) {
      httpError(400, "Total grade weight exceeds 100%");
    }
  }

  private async ensureSingleFinalGrade(courseId: string, userId: string) {
    const existing = await this.getCachedFinalGrade(courseId, userId);
    if (existing) {
      httpError(
        409,
        "Final grade already exists for this student in this course"
      );
    }
  }

  private preventFinalDelete(grade: IGrade) {
    if (grade.isFinalGrade) {
      httpError(403, "Final grades cannot be deleted");
    }
  }

  private async autoFinalize(courseId: string, userId: string) {
    const { results } = await this.gradeRepository.getUserGradesInCourse(
      courseId,
      userId
    );

    const totalWeight = results
      .filter((g) => !g.isFinalGrade)
      .reduce((s, g) => s + g.weight, 0);

    if (totalWeight === 100) {
      const finalScore =
        results.reduce((s, g) => s + (g.obtained / g.total) * g.weight, 0) /
        100;

      await this.gradeRepository.upsertForTarget({
        course_id: courseId,
        user_id: userId,
        name: "Final Grade",
        weight: 100,
        obtained: finalScore * 100,
        total: 100,
        isFinalGrade: true,
      });
    }
  }

  private async getCachedFinalGrade(courseId: string, userId: string) {
    const cacheKey = this.finalKey(courseId, userId);

    const cached = await this.cacheService.get<IGrade | null>(cacheKey);
    if (cached !== null && cached !== undefined) return cached;

    const final = await this.gradeRepository.getFinalGrade(courseId, userId);

    await this.cacheService.set(cacheKey, final ?? null, this.FINAL_TTL);
    return final;
  }

  private computeStats(grades: IGrade[]) {
    if (!grades.length) return { average: 0, median: 0 };

    const scores = grades.map((g) => (g.obtained / g.total) * g.weight);

    const average =
      scores.reduce((s, v) => s + v, 0) /
      grades.reduce((s, g) => s + g.weight, 0);

    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

    return { average: average * 100, median: median * 100 };
  }

  public async getGradeById(id: string): Promise<IGrade> {
    try {
      const grade = await this.gradeRepository.findById(id);
      if (!grade) httpError(404, "Grade not found");
      return this.toSafe(grade);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[GradeService] getGradeById failed: ${err?.message}`);
      throw new HttpError(500, "Internal server error");
    }
  }

  public async getGradesForCourse(courseId: string, page = 1, limit = 50) {
    try {
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
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[GradeService] getGradesForCourse failed: ${err?.message}`);
      throw new HttpError(500, "Internal server error");
    }
  }

  public async getGradesForUser(courseId: string, userId: string) {
    try {
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
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[GradeService] getGradesForUser failed: ${err?.message}`);
      throw new HttpError(500, "Internal server error");
    }
  }

  public async getUserStatsInCourse(courseId: string, userId: string) {
    try {
      const { results } = await this.gradeRepository.getUserGradesInCourse(
        courseId,
        userId
      );

      const nonFinal = results.filter((g) => !g.isFinalGrade);
      const stats = this.computeStats(nonFinal);

      return stats;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[GradeService] getUserStatsInCourse failed: ${err?.message}`
      );
      throw new HttpError(500, "Internal server error");
    }
  }

  public async getCourseStats(courseId: string) {
    try {
      const { results } = await this.gradeRepository.findAll({
        courseId,
        limit: 500,
      });

      const grouped: Record<string, IGrade[]> = {};
      for (const g of results) {
        if (!grouped[(g.user_id as any).toString()])
          grouped[(g.user_id as any).toString()] = [];
        grouped[(g.user_id as any).toString()].push(g);
      }

      const stats = Object.values(grouped).map((grades) =>
        this.computeStats(grades.filter((g) => !g.isFinalGrade))
      );

      const averages = stats.map((s) => s.average);
      const sorted = [...averages].sort((a, b) => a - b);

      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];

      const average =
        averages.reduce((s, v) => s + v, 0) / (averages.length || 1);

      return { average, median };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[GradeService] getCourseStats failed: ${err?.message}`);
      throw new HttpError(500, "Internal server error");
    }
  }

  public async upsertGrade(input: {
    courseId: string;
    userId: string;
    assignmentId?: string;
    testId?: string;
    quizId?: string;
    name: string;
    weight: number;
    obtained: number;
    total: number;
    isFinalGrade?: boolean;
  }): Promise<IGrade> {
    try {
      const [_, __, final] = await Promise.all([
        this.courseService.getCourseById(input.courseId),
        this.userService.getUser(input.userId),
        this.getCachedFinalGrade(input.courseId, input.userId),
      ]);

      if (final) {
        httpError(
          423,
          "Grades are locked because final grade is already issued"
        );
      }

      this.validateScore(input.obtained, input.total);
      await this.validateWeights(input.courseId, input.userId, input.weight);

      if (input.isFinalGrade) {
        await this.ensureSingleFinalGrade(input.courseId, input.userId);
      }

      const grade = await this.gradeRepository.upsertForTarget({
        course_id: input.courseId,
        user_id: input.userId,
        assignment_id: input.assignmentId,
        test_id: input.testId,
        quiz_id: input.quizId,
        name: input.name,
        weight: input.weight,
        obtained: input.obtained,
        total: input.total,
        isFinalGrade: input.isFinalGrade,
      });

      await Promise.all([
        this.autoFinalize(input.courseId, input.userId),
        this.cacheService.delete(
          this.key("list", input.courseId, input.userId)
        ),
        this.cacheService.delete(this.finalKey(input.courseId, input.userId)),
      ]);

      return this.toSafe(grade);
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[GradeService] upsertGrade failed: ${err?.message}`);
      throw new HttpError(500, "Internal server error");
    }
  }

  public async deleteGrade(id: string): Promise<boolean> {
    try {
      const grade = await this.gradeRepository.findById(id);
      if (!grade) httpError(404, "Grade not found");

      this.preventFinalDelete(grade);

      const deleted = await this.gradeRepository.delete(id);
      return deleted;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(`[GradeService] deleteGrade failed: ${err?.message}`);
      throw new HttpError(500, "Internal server error");
    }
  }
}

export { GradeService };
