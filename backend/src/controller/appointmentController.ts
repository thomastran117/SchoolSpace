import type { AppointmentService } from "../service/appointmentService";

class AppointmentController {
  private readonly appointmentService: AppointmentService;

  constructor(dependencies: { appointmentService: AppointmentService }) {
    this.appointmentService = dependencies.appointmentService;
  }
}

export { AppointmentController };
