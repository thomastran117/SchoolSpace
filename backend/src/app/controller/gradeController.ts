import type { GradeService } from "@service/gradeService";

class GradeController {
  private readonly gradeService: GradeService;

  constructor(dependencies: { gradeService: GradeService }) {
    this.gradeService = dependencies.gradeService;
  }
}

export { GradeController };
export default GradeController;
