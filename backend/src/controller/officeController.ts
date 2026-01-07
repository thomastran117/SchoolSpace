import type { OfficeService } from "../service/officeService";

class OfficeController {
  private readonly officeService: OfficeService;

  constructor(dependencies: { officeService: OfficeService }) {
    this.officeService = dependencies.officeService;
  }
}

export { OfficeController };
