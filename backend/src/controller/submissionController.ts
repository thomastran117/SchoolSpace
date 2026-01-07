import type { SubmissionService } from "../service/submissionService";

class SubmissionController {
  private readonly submissionService: SubmissionService;

  constructor(dependencies: { submissionService: SubmissionService }) {
    this.submissionService = dependencies.submissionService;
  }
}

export { SubmissionController };
