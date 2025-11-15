import type { LectureService } from "../service/lectureService";

class LectureController{
    private readonly lectureService: LectureService;

    constructor(lectureService: LectureService){
        this.lectureService = lectureService;
    }
}

export { LectureController }