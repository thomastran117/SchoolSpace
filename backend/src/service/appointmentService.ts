import type { CacheService } from "./cacheService";

class AppointmentService {
  private readonly cacheService: CacheService;

  constructor(dependencies: {cacheService: CacheService}) {
    this.cacheService = dependencies.cacheService;
  }

  public async createOfficeAppoinment() {
    return;
  }

  public async cancelOfficeAppointment() {
    return;
  }

  public async getAllOfficeAppointments() {
    return;
  }

  public async getOfficeAppointment() {
    return;
  }

  public async getAllAnnoucementsByCourse() {
    return;
  }
}

export { AppointmentService };
