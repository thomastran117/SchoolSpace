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

  public async enrollCourse() {
    return;
  }

  public async unenrollCourse() {
    return;
  }

  public async findStudentsEnrolledInCourse() {
    return;
  }

  public async findTeacherTeachingCourse() {
    return;
  }

  public async findCoursesEnrolledByStudent() {
    return;
  }

  public async findCoursesTaughtByTeacher() {
    return;
  }
}

export { EnrollmentService };
