import type { BookingService } from "../service/bookingService";

class BookingController{
    private readonly bookingService: BookingService;

    constructor(bookingService: BookingService){
        this.bookingService = bookingService;
    }
}

export { BookingController }