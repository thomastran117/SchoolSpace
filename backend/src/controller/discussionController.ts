import type { DiscussionService } from "../service/discussionService";

class DiscussionController {
  private readonly discussionService: DiscussionService;

  constructor(discussionService: DiscussionService) {
    this.discussionService = discussionService;
  }
}

export { DiscussionController };
