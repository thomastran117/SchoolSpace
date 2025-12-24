import amqp, { Channel } from "amqplib";

import env from "../config/envConfigs";
import logger from "../utility/logger";

const QUEUE = "email.send";

type EmailJob =
  | {
      type: "VERIFY_EMAIL";
      email: string;
      code: string;
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

class EmailQueue {
  private channel?: Channel;
  private available = false;
  private readonly maxRetries = 3;
  private readonly baseDelayMs = 100;

  public get isAvailable(): boolean {
    return this.available;
  }

  public async init(): Promise<void> {
    if (!env.rabbitMqUrl) {
      logger.warn("[EmailQueue] RabbitMQ not configured — queue disabled");
      this.available = false;
      return;
    }

    try {
      const conn = await amqp.connect(env.rabbitMqUrl);
      this.channel = await conn.createChannel();

      await this.channel.assertQueue(QUEUE, {
        durable: true,
        deadLetterExchange: "",
        deadLetterRoutingKey: "email.send.retry",
      });

      this.available = true;
    } catch (err) {
      this.available = false;
      logger.warn(
        `[EmailQueue] Failed to connect — falling back to direct email: ${err}`
      );
    }
  }

  public async enqueue(job: EmailJob): Promise<boolean> {
    if (!this.available || !this.channel) {
      return false;
    }

    return this.retry(async () => {
      this.channel!.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), {
        persistent: true,
      });
    });
  }

  private async retry(operation: () => void): Promise<boolean> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        operation();
        return true;
      } catch (err) {
        attempt++;

        if (attempt > this.maxRetries || !this.isTransientError(err)) {
          logger.warn(
            `[EmailQueue] Permanent failure after ${attempt} attempts: ${err}`
          );
          this.available = false;
          return false;
        }

        const delay = this.computeBackoff(attempt);

        logger.warn(
          `[EmailQueue] Transient failure, retrying in ${delay}ms (${attempt}/${this.maxRetries})`
        );

        await this.sleep(delay);
      }
    }

    return false;
  }

  private computeBackoff(attempt: number): number {
    const maxDelay = this.baseDelayMs * Math.pow(2, attempt);
    return Math.floor(Math.random() * maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isTransientError(err: any): boolean {
    const msg = err?.message?.toLowerCase() ?? "";

    return (
      msg.includes("connection") ||
      msg.includes("timeout") ||
      msg.includes("socket") ||
      msg.includes("econnreset") ||
      msg.includes("channel closed")
    );
  }

  public enqueueVerifyEmail(email: string, code: string): Promise<boolean> {
    return this.enqueue({
      type: "VERIFY_EMAIL",
      email,
      code,
    });
  }

  public enqueueWelcomeEmail(email: string): Promise<boolean> {
    return this.enqueue({
      type: "WELCOME_EMAIL",
      email,
    });
  }
}

export { EmailQueue };
