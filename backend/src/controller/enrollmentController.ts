import type { EnrollmentService } from "../service/enrollmentService";

class EnrollmentController {
  private readonly enrollmentService: EnrollmentService;

  constructor(enrollmentService: EnrollmentService) {
    this.enrollmentService = enrollmentService;
  }
}

export { EnrollmentController };
