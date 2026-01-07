import type { CacheService } from "./cacheService";

class DiscussionService {
  private readonly cacheService: CacheService;

  constructor(dependencies: {cacheService: CacheService}) {
    this.cacheService = dependencies.cacheService;
  }

  public async createDiscussion() {
    return;
  }

  public async updateDiscussion() {
    return;
  }

  public async deleteDiscussion() {
    return;
  }

  public async getDiscussion() {
    return;
  }

  public async getAllDiscussions() {
    return;
  }

  public async createReply() {
    return;
  }

  public async updateReply() {
    return;
  }

  public async deleteReply() {
    return;
  }

  public async getReply() {
    return;
  }

  public async getAllReplies() {
    return;
  }
}

export { DiscussionService };
