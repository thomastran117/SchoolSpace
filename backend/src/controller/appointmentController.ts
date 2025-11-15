import type { AppointmentService } from "../service/appointmentService";

class AppointmentController {
  private readonly appointmentService: AppointmentService;

  constructor(appointmentService: AppointmentService) {
    this.appointmentService = appointmentService;
  }
}

export { AppointmentController };
