import { HttpError, InternalServerError, NotImplementedError } from "../error";
import type { EnrollmentRepository } from "../repository";
import logger from "../utility/logger";
import type { CodeService } from "./codeService";

class EnrollmentService {
  private readonly enrollmentRepository: EnrollmentRepository;
  private readonly codeService: CodeService;

  constructor(dependencies: {
    codeService: CodeService;
    enrollmentRepository: EnrollmentRepository;
  }) {
    this.codeService = dependencies.codeService;
    this.enrollmentRepository = dependencies.enrollmentRepository;
  }

  public async isEnrolled(courseId: number, userId: number) {
    try {
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(
        userId,
        courseId
      );
      if (enrollment) {
        return true;
      } else {
        return false;
      }
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[EnrollmentService] isEnrolled failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async enrollCourse(courseId: number, userId: number) {
    try {
      const enrollment = await this.enrollmentRepository.enroll(
        userId,
        courseId
      );
      return enrollment;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[EnrollmentService] enrollCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async unenrollCourse(courseId: number, userId: number) {
    try {
      await this.enrollmentRepository.unenrollByUserAndCourse(courseId, userId);
      return true;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[EnrollmentService] unenrollCourse failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async enrollCourseWithCode(code: string, userId: number) {
    try {
      const courseId = await this.codeService.redeemEnrollmentCodeByCode(code);
      const enrollment = await this.enrollmentRepository.enroll(
        userId,
        courseId
      );
      return { enrollment, courseId };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[EnrollmentService] enrollCourseWithCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async generateEnrollmentCode(courseId: number) {
    try {
      const code = await this.codeService.generateEnrollmentCode(courseId);
      return code;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[EnrollmentService] generateEnrollmentCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async deleteEnrollmentCode(code: string) {
    try {
      throw new NotImplementedError({
        message: "Functionality is not implemented yet.",
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[EnrollmentService] deleteEnrollmentCode failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }
}

export { EnrollmentService };
