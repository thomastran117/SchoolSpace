// npx tsx src/workers/paymentWorker.ts
import amqp, { Channel, ConsumeMessage } from "amqplib";
import container from "../container";
import { markWorkerAlive, markWorkerDead } from "../resource/workerHealth";
import env from "../config/envConfigs";
import type { PaymentService } from "../service/paymentService";
import logger from "../utility/logger";

interface PaymentJobData {
  paypalOrderId: string;
}

const QUEUE = "payment.capture";
const RETRY_QUEUE = "payment.capture.retry";
const DLQ = "payment.capture.dlq";

const MAX_RETRIES = 10;
const PREFETCH = 3;

(async () => {
  try {
    await container.initialize();
    logger.info("[Worker] Container initialized.");

    const conn = await amqp.connect(env.rabbitMqUrl);
    const channel = await conn.createChannel();

    await channel.assertQueue(QUEUE, {
      durable: true,
      deadLetterExchange: "",
      deadLetterRoutingKey: RETRY_QUEUE,
    });

    await channel.assertQueue(RETRY_QUEUE, {
      durable: true,
      messageTtl: 5000,
      deadLetterExchange: "",
      deadLetterRoutingKey: QUEUE,
    });

    await channel.assertQueue(DLQ, { durable: true });

    channel.prefetch(PREFETCH);

    markWorkerAlive();
    setInterval(markWorkerAlive, 15_000);

    logger.info("[Worker] Payment worker started (RabbitMQ)");

    await channel.consume(QUEUE, async (msg: any) => {
      if (!msg) return;

      const retryCount = msg.properties.headers?.["x-retry-count"] ?? 0;

      let payload: PaymentJobData;

      try {
        payload = JSON.parse(msg.content.toString());
      } catch {
        logger.error("[Worker] Invalid message format");
        channel.nack(msg, false, false);
        return;
      }

      const { paypalOrderId } = payload;

      if (!paypalOrderId) {
        logger.error("[Worker] Missing paypalOrderId");
        channel.nack(msg, false, false);
        return;
      }

      const scope = container.createScope();
      const paymentService = scope.resolve<PaymentService>("PaymentService");

      try {
        logger.info(`[Worker] Capturing payment ${paypalOrderId}`);

        const result = await paymentService.captureOrder(paypalOrderId);

        if (result.status !== "COMPLETED") {
          throw new Error(`Unexpected status: ${result.status}`);
        }

        logger.info(`[Worker] Payment captured ${paypalOrderId}`);
        channel.ack(msg);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        logger.error(
          `[Worker] Capture failed ${paypalOrderId}: ${error.message}`,
        );

        if (retryCount >= MAX_RETRIES) {
          logger.warn(
            `[Worker] Max retries exceeded (${MAX_RETRIES}) for ${paypalOrderId}`,
          );

          channel.sendToQueue(DLQ, msg.content, { persistent: true });

          channel.ack(msg);
        } else {
          channel.sendToQueue(RETRY_QUEUE, msg.content, {
            persistent: true,
            headers: {
              "x-retry-count": retryCount + 1,
            },
          });

          channel.ack(msg);
        }
      } finally {
        scope.dispose();
      }
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`[Worker] Fatal error: ${error.message}`);
    markWorkerDead();
    process.exit(1);
  }
})();
