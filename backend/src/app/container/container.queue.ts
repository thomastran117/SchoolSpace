/**
 * @file container.queues.ts
 * @description
 * Factory methods to create queues objects
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */
import type { Registration } from "@container/container.types";
import { CourseQueue } from "@queue/courseQueue";
import { EmailQueue } from "@queue/emailQueue";
import logger from "@utility/logger";

function registerQueueModules(): Map<string, Registration<any>> {
  try {
    const queues = new Map<string, Registration<any>>();

    queues.set("EmailQueue", {
      factory: () => new EmailQueue(),
      lifetime: "singleton",
      deps: [],
    });

    queues.set("CourseQueue", {
      factory: () => new CourseQueue(),
      lifetime: "singleton",
      deps: [],
    });

    return queues;
  } catch (err: any) {
    logger.error(
      `[Container] Queue registration failed: ${err?.message ?? err}`
    );
    process.exit(1);
  }
}

export { registerQueueModules };
