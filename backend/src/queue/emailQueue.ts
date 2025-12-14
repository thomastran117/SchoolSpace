import amqp, { Channel } from "amqplib";
import env from "../config/envConfigs";
import type { EmailJob } from "../service/emailService";
import logger from "../utility/logger";

const QUEUE = "email.send";

class EmailQueue {
  private channel!: Channel;

  public async init(): Promise<void> {
    const conn = await amqp.connect(env.rabbitMqUrl);
    this.channel = await conn.createChannel();

    await this.channel.assertQueue("email.send", {
      durable: true,
      deadLetterExchange: "",
      deadLetterRoutingKey: "email.send.retry",
    });
  }

  public async enqueue(job: EmailJob): Promise<void> {
    if (!this.channel) {
      throw new Error("EmailQueue not initialized");
    }

    this.channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), {
      persistent: true,
    });

    logger.info(`[EmailQueue] Enqueued email job (${job.type})`);
  }

  public async enqueueVerifyEmail(
    email: string,
    verifyUrl: string,
  ): Promise<void> {
    await this.enqueue({
      type: "VERIFY_EMAIL",
      email,
      verifyUrl,
    });
  }

  public async enqueueWelcomeEmail(email: string): Promise<void> {
    await this.enqueue({
      type: "WELCOME_EMAIL",
      email,
    });
  }
}

export { EmailQueue };
