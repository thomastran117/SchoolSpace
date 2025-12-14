// npx tsx src/workers/emailWorker.ts
import amqp from "amqplib";
import container from "../container";
import { markWorkerAlive, markWorkerDead } from "../resource/workerHealth";
import { EmailService } from "../service/emailService";
import logger from "../utility/logger";

type EmailJob =
  | {
      type: "VERIFY_EMAIL";
      email: string;
      verifyUrl: string;
    }
  | {
      type: "WELCOME_EMAIL";
      email: string;
    }
  | {
      type: "GENERIC";
      to: string;
      subject: string;
      html: string;
    };

const QUEUE = "email.send";
const RETRY_QUEUE = "email.send.retry";
const DLQ = "email.send.dlq";

const MAX_RETRIES = 5;
const PREFETCH = 5;

(async () => {
  try {
    await container.initialize();
    logger.info("[EmailWorker] Container initialized");

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

    markWorkerAlive();
    setInterval(markWorkerAlive, 15_000);

    logger.info("[EmailWorker] Email worker started");

    await channel.consume(QUEUE, async (msg) => {
      if (!msg) return;

      const retryCount = msg.properties.headers?.["x-retry-count"] ?? 0;

      let job: EmailJob;

      try {
        job = JSON.parse(msg.content.toString());
      } catch {
        logger.error("[EmailWorker] Invalid message payload");
        channel.sendToQueue(DLQ, msg.content, { persistent: true });
        channel.ack(msg);
        return;
      }

      const scope = container.createScope();
      const emailService = scope.resolve<EmailService>("EmailService");

      try {
        switch (job.type) {
          case "VERIFY_EMAIL":
            await emailService.sendVerificationEmail(job.email, job.verifyUrl);
            break;

          case "WELCOME_EMAIL":
            await emailService.sendWelcomeEmail(job.email);
            break;

          case "GENERIC":
            await emailService.sendEmail(job);
            break;

          default:
            throw new Error("Unknown email job type");
        }

        logger.info(`[EmailWorker] Email sent (${job.type})`);
        channel.ack(msg);
      } catch (err) {
        logger.error(`[EmailWorker] Send failed: ${String(err)}`);

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
    logger.error(`[EmailWorker] Fatal error: ${String(err)}`);
    markWorkerDead();
    process.exit(1);
  }
})();
