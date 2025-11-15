import type { CacheService } from "./cacheService";

class BookingService {
  private readonly cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }
}

export { BookingService };
