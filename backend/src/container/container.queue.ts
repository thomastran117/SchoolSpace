import * as Queues from "../queue";
import logger from "../utility/logger";
import type { Registration } from "./container.types";

function registerQueueModules(): Map<string, Registration<any>> {
  try {
    const queues = new Map<string, Registration<any>>();

    queues.set("EmailQueue", {
      factory: () => new Queues.EmailQueue(),
      lifetime: "singleton",
    });

    queues.set("CourseQueue", {
      factory: () => new Queues.CourseQueue(),
      lifetime: "singleton",
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
