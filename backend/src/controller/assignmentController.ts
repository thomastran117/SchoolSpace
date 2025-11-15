import type { AssignmentService } from "../service/assignmentService";

class AssignmentController{
    private readonly assignmentService: AssignmentService;

    constructor(assignmentService: AssignmentService){
        this.assignmentService = assignmentService;
    }
}

export { AssignmentController }