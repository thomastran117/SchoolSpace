import type { FileService } from "./fileService";

class SubmissionService {
  private readonly fileService: FileService;
  constructor(dependencies: { fileService: FileService }) {
    this.fileService = dependencies.fileService;
  }

  public async submitAssignment() {
    return;
  }

  public async unsubmitAssignment() {
    return;
  }
}

export { SubmissionService };
