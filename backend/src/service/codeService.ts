import type { CacheService } from "./cacheService";
import type { FileService } from "./fileService";

class CodeService {
  private readonly cacheService: CacheService;

  constructor(dependencies: {
    cacheService: CacheService;
  }) {
    this.cacheService = dependencies.cacheService;
  }
}

export { CodeService };
