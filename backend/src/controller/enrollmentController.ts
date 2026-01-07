import type { EnrollmentService } from "../service/enrollmentService";

class EnrollmentController {
  private readonly enrollmentService: EnrollmentService;

  constructor(dependencies: { enrollmentService: EnrollmentService }) {
    this.enrollmentService = dependencies.enrollmentService;
  }
}

export { EnrollmentController };
