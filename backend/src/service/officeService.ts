import type { CacheService } from "./cacheService";

class OfficeService{
    private readonly cacheService: CacheService;

    constructor(cacheService: CacheService){
        this.cacheService = cacheService;
    }
}

export { OfficeService }