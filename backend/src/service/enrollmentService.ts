import type { UserService } from "./userService";
import type { CourseService } from "./courseService";
import { HttpError, httpError } from "../utility/httpUtility";

class EnrollmentService {
  private readonly userService: UserService;
  private readonly courseService: CourseService;

  constructor(userService: UserService, courseService: CourseService) {
    this.userService = userService;
    this.courseService = courseService;
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
