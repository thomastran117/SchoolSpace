import type { CacheService } from "./cacheService";

class ReviewService {
  private readonly cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  public async createReview() {
    return;
  }

  public async updateReview() {
    return;
  }

  public async deleteReview() {
    return;
  }

  public async getReview() {
    return;
  }

  public async getAllReviews() {
    return;
  }

  public async getAllReviewsByCourse() {
    return;
  }

  public async getAllReviewsByUser() {
    return;
  }
}

export { ReviewService };
