import type { TutorService } from "../service/tutorService";

class TutorController {
  private readonly tutorService: TutorService;

  constructor(dependencies: { tutorService: TutorService }) {
    this.tutorService = dependencies.tutorService;
  }
}

export { TutorController };
