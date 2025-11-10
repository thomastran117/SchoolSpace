import type { Job, WorkerOptions } from "bullmq";
import { Worker } from "bullmq";
import { PaymentService } from "../service/paymentService";
import { connectionWorker } from "../resource/redis";
import logger from "../utility/logger";

interface PaymentJobData {
  paypalOrderId: string;
}

const paymentService = new PaymentService();

const workerOptions: WorkerOptions = {
  connection: connectionWorker,
  concurrency: 3,
  limiter: { max: 10, duration: 1000 },
  settings: {
    backoffStrategy: (attempts: number) => Math.pow(2, attempts) * 1000,
  },
};

const worker = new Worker<PaymentJobData>(
  "payment",
  async (job: Job<PaymentJobData>) => {
    const { paypalOrderId } = job.data;

    if (!paypalOrderId) {
      throw new Error("Missing paypalOrderId in job data");
    }

    logger.info(`[Worker] Processing payment for order ${paypalOrderId}...`);

    try {
      const result = await paymentService.captureOrder(paypalOrderId);

      if (result.status === "COMPLETED") {
        logger.info(`[Worker] ✅ Payment captured for ${paypalOrderId}`);
        return { status: "success", result };
      }

      throw new Error(`Unexpected PayPal order status: ${result.status}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(
        `[Worker] Capture failed for ${paypalOrderId}: ${error.message}`,
      );
      throw error;
    }
  },
  workerOptions,
);

worker.on("ready", () => {
  logger.info("[Worker] Payment worker started");
});

worker.on("failed", async (job, err) => {
  logger.error(
    `[Worker] Job failed for ${job?.id}: ${err.message} (attempt ${job?.attemptsMade})`,
  );

  if (job && job.attemptsMade >= 10) {
    logger.warn(
      `[Worker] Job ${job.id} exceeded retry limit (10). Removing from queue.`,
    );
    try {
      await job.remove();
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error(`[Worker] Failed to remove job ${job.id}: ${error.message}`);
    }
  }
});

worker.on("completed", (job, result) => {
  logger.info(
    `[Worker] Job completed for ${job.id} with result: ${JSON.stringify(result)}`,
  );
});

worker.on("error", (err) => {
  logger.error(`[Worker] Global error: ${err.message}`);
});

export default worker;
