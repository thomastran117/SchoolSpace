import amqp from "amqplib";
import container from "../container";
import logger from "../utility/logger";

type CourseWarmJob =
  | {
      type: "COURSE_DETAIL";
      courseId: string;
    }
  | {
      type: "COURSE_LIST";
      params: {
        teacherId?: string;
        year?: number;
        page: number;
        limit: number;
      };
    };

const QUEUE = "course.warm";
const RETRY_QUEUE = "course.warm.retry";
const DLQ = "course.warm.dlq";

const MAX_RETRIES = 5;
const PREFETCH = 5;

(async () => {
  try {
    await container.initialize();

    const conn = await amqp.connect(process.env.RABBITMQ_URL!);
    const channel = await conn.createChannel();

    await channel.assertQueue(QUEUE, {
      durable: true,
      deadLetterExchange: "",
      deadLetterRoutingKey: RETRY_QUEUE,
    });

    await channel.assertQueue(RETRY_QUEUE, {
      durable: true,
      messageTtl: 3000,
      deadLetterExchange: "",
      deadLetterRoutingKey: QUEUE,
    });

    await channel.assertQueue(DLQ, { durable: true });

    channel.prefetch(PREFETCH);

    logger.info("[CourseWorker] Course worker started");

    await channel.consume(QUEUE, async (msg) => {
      if (!msg) return;

      const retryCount = msg.properties.headers?.["x-retry-count"] ?? 0;

      let job: CourseWarmJob;

      try {
        job = JSON.parse(msg.content.toString());
      } catch {
        logger.error("[CourseWorker] Invalid message payload");
        channel.sendToQueue(DLQ, msg.content, { persistent: true });
        channel.ack(msg);
        return;
      }

      const scope = container.createScope();

      try {
        switch (job.type) {
          case "COURSE_DETAIL":
            logger.info(
              `[CourseWorker] Warm course detail requested`
            
            );
            break;

          case "COURSE_LIST":
            logger.info(
              `[CourseWorker] Warm course list requested`
            );
            break;

          default:
            throw new Error("Unknown course warm job type");
        }

        channel.ack(msg);
      } catch (err) {
        logger.error(
          `[CourseWorker] Job failed: ${String(err)}`,
        );

        if (retryCount >= MAX_RETRIES) {
          channel.sendToQueue(DLQ, msg.content, { persistent: true });
          channel.ack(msg);
        } else {
          channel.sendToQueue(RETRY_QUEUE, msg.content, {
            persistent: true,
            headers: { "x-retry-count": retryCount + 1 },
          });
          channel.ack(msg);
        }
      } finally {
        scope.dispose();
      }
    });
  } catch (err) {
    logger.error(`[CourseWorker] Fatal error: ${String(err)}`);
    process.exit(1);
  }
})();
