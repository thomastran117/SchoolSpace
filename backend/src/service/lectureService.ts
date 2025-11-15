import type { CacheService } from "./cacheService";
import type { FileService } from "./fileService";

class LectureService{
    private readonly cacheService: CacheService;
    private readonly fileService: FileService;

    constructor(cacheService: CacheService, fileService: FileService){
        this.cacheService = cacheService;
        this.fileService = fileService;
    }

    public async createLecture(){
        return;
    }

    public async updateLecture(){
        return;
    }

    public async deleteLecture(){
        return;
    }

    public async getLecture(){
        return;
    }

    public async getAllLecture(){
        return;
    }

    public async getAllLecturesByCourse(){
        return;
    }
}

export { LectureService }