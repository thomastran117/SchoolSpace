import { HttpError, InternalServerError } from "../error";
import logger from "../utility/logger";
import type { CourseService } from "./courseService";
import type { UserService } from "./userService";

class EnrollmentService {
  private readonly userService: UserService;
  private readonly courseService: CourseService;

  constructor(dependencies: {
    userService: UserService;
    courseService: CourseService;
  }) {
    this.userService = dependencies.userService;
    this.courseService = dependencies.courseService;
  }

  public async enrollCourse(courseId: number, userId: number) {
    try {
      console.log("hello");
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
      console.log("hello");
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
      console.log("hello");
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
      console.log("hello");
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
      console.log("hello");
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
