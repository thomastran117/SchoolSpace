import type { AnnoucementService } from "../service/annoucementService";

class AnnouncementController {
  private readonly annoucementService: AnnoucementService;

  constructor(annoucementService: AnnoucementService) {
    this.annoucementService = annoucementService;
  }
}

export { AnnouncementController };
