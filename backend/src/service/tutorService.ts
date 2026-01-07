import type { CacheService } from "./cacheService";

class TutorService {
  private readonly cacheService: CacheService;

  constructor(dependencies: { cacheService: CacheService }) {
    this.cacheService = dependencies.cacheService;
  }
}

export { TutorService };
