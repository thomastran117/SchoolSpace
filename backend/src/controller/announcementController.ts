import type { AnnoucementService } from "../service/annoucementService";

class AnnouncementController {
  private readonly annoucementService: AnnoucementService;

  constructor(dependencies: { annoucementService: AnnoucementService }) {
    this.annoucementService = dependencies.annoucementService;
  }
}

export { AnnouncementController };
