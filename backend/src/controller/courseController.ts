import type { CourseService } from "../service/courseService";

class CourseController{
    private readonly courseService: CourseService;

    constructor(courseService: CourseService){
        this.courseService = courseService;
    }
}

export { CourseController }