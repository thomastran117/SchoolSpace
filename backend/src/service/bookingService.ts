import type { CacheService } from "./cacheService";

class BookingService {
  private readonly cacheService: CacheService;

  constructor(dependencies: { cacheService: CacheService }) {
    this.cacheService = dependencies.cacheService;
  }
}

export { BookingService };
