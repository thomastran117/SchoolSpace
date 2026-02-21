import type { AssignmentService } from "@service/assignmentService";

class AssignmentController {
  private readonly assignmentService: AssignmentService;

  constructor(dependencies: { assignmentService: AssignmentService }) {
    this.assignmentService = dependencies.assignmentService;
  }
}

export { AssignmentController };
export default AssignmentController;
