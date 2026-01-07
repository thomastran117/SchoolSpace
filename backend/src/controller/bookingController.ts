import type { BookingService } from "../service/bookingService";

class BookingController {
  private readonly bookingService: BookingService;

  constructor(dependencies: { bookingService: BookingService }) {
    this.bookingService = dependencies.bookingService;
  }
}

export { BookingController };
