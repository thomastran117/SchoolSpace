import type { GradeService } from "../service/gradeService";

class GradeController{
    private readonly gradeService: GradeService;

    constructor(gradeService: GradeService){
        this.gradeService = gradeService;
    }
}

export { GradeController }