import type { FileService } from "./fileService";

class SubmissionService {
  private readonly fileService: FileService;
  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  public async submitAssignment() {
    return;
  }

  public async unsubmitAssignment() {
    return;
  }
}

export { SubmissionService };
