import type { LectureService } from "../service/lectureService";

class LectureController {
  private readonly lectureService: LectureService;

  constructor(dependencies: { lectureService: LectureService }) {
    this.lectureService = dependencies.lectureService;
  }
}

export { LectureController };
