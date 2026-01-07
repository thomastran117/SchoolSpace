import type { DiscussionService } from "../service/discussionService";

class DiscussionController {
  private readonly discussionService: DiscussionService;

  constructor(dependencies: { discussionService: DiscussionService }) {
    this.discussionService = dependencies.discussionService;
  }
}

export { DiscussionController };
