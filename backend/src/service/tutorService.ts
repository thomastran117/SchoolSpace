import type { CacheService } from "./cacheService";

class TutorService{
    private readonly cacheService: CacheService;

    constructor(cacheService: CacheService){
        this.cacheService = cacheService;
    }
}

export { TutorService }