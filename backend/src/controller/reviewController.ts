import type { ReviewService } from "../service/reviewService";

class ReviewController {
  private readonly reviewService: ReviewService;

  constructor(dependencies: { reviewService: ReviewService }) {
    this.reviewService = dependencies.reviewService;
  }
}

export { ReviewController };
