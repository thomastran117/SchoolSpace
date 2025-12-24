import { CourseQueue } from "../queue/courseQueue";
import { EmailQueue } from "../queue/emailQueue";

import type { Registration } from "./container.types";

import logger from "../utility/logger";

function registerQueueModules(): Map<string, Registration<any>> {
  try {
    const queues = new Map<string, Registration<any>>();

    queues.set("EmailQueue", {
      factory: () => new EmailQueue(),
      lifetime: "singleton",
    });

    queues.set("CourseQueue", {
      factory: () => new CourseQueue(),
      lifetime: "singleton",
    });

    return queues;
  } catch (err: any) {
    logger.error(
      `[Container] Queue registration failed: ${err?.message ?? err}`,
    );
    process.exit(1);
  }
}

export { registerQueueModules };
