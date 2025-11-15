import type { OfficeService } from "../service/officeService";

class OfficeController {
  private readonly officeService: OfficeService;

  constructor(officeService: OfficeService) {
    this.officeService = officeService;
  }
}

export { OfficeController };
