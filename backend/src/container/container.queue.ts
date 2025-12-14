import { EmailQueue } from "../queue/emailQueue";

import type { Registration } from "./container.types";

import logger from "../utility/logger";
import { Container } from "./container.main";

function registerQueueModules(): Map<string, Registration<any>> {
  try {
    const queues = new Map<string, Registration<any>>();

    queues.set("EmailQueue", {
      factory: () => new EmailQueue(),
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

async function bootstrapQueues(container: Container) {
  const emailQueue = container.resolve<EmailQueue>("EmailQueue");
  await emailQueue.init();
}

export { bootstrapQueues, registerQueueModules };
