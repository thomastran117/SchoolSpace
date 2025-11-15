import type { SubmissionService } from "../service/submissionService";

class SubmissionController {
  private readonly submissionService: SubmissionService;

  constructor(submissionService: SubmissionService) {
    this.submissionService = submissionService;
  }
}

export { SubmissionController };
