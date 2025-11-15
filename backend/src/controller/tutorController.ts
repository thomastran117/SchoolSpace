import type { TutorService } from "../service/tutorService";

class TutorController{
    private readonly tutorService: TutorService;

    constructor(tutorService: TutorService){
        this.tutorService = tutorService;
    }
}

export { TutorController }