import type { CacheService } from "./cacheService";

class AnnoucementService{
    private readonly cacheService: CacheService;

    constructor(cacheService: CacheService){
        this.cacheService = cacheService;
    }

    public async createAnnoucement(){
        return;
    }

    public async updateAnnoucement(){
        return;
    }

    public async deleteAnnoucement(){
        return;
    }

    public async getAnnoucement(){
        return;
    }

    public async getAllAnnoucements(){
        return;
    }

    public async getAllAnnoucementsByCourse(){
        return;
    }
}

export { AnnoucementService }