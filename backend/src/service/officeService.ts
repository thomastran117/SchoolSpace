import type { CacheService } from "./cacheService";

class OfficeService {
  private readonly cacheService: CacheService;

  constructor(dependencies: { cacheService: CacheService }) {
    this.cacheService = dependencies.cacheService;
  }
}

export { OfficeService };
