import type { ReviewService } from "../service/reviewService";

class ReviewController{
    private readonly reviewService: ReviewService;

    constructor(reviewService: ReviewService){
        this.reviewService = reviewService;
    }
}

export { ReviewController }