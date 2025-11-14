import type { CacheService } from "./cacheService";
import type { FileService } from "./fileService";

class CourseService{
    private readonly cacheService: CacheService;
    private readonly fileService: FileService;

    constructor(cacheService: CacheService, fileService: FileService){
        this.cacheService = cacheService;
        this.fileService = fileService;
    }

    public async createCourse(){
        return;
    }

    public async updateCourse(){
        return;
    }

    public async deleteCourse(){
        return;
    }

    public async getCourse(){
        return;
    }

    public async getAllCourses(){
        return;
    }

    public async getAllCoursesByStudent(){
        return;
    }

    public async getAllCoursesByTeacher(){
        return;
    }
}

export { CourseService }