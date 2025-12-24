import amqp, { Channel } from "amqplib";

import env from "../config/envConfigs";
import logger from "../utility/logger";

const QUEUE = "course.warm";

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

class CourseQueue {
  private channel?: Channel;
  private available = false;

  private readonly maxRetries = 3;
  private readonly baseDelayMs = 100;

  public get isAvailable(): boolean {
    return this.available;
  }

  public async init(): Promise<void> {
    if (!env.rabbitMqUrl) {
      logger.warn("[CourseQueue] RabbitMQ not configured — queue disabled");
      this.available = false;
      return;
    }

    try {
      const conn = await amqp.connect(env.rabbitMqUrl);
      this.channel = await conn.createChannel();

      await this.channel.assertQueue(QUEUE, {
        durable: true,
        deadLetterExchange: "",
        deadLetterRoutingKey: "course.warm.retry",
      });

      this.available = true;
      logger.info("[CourseQueue] Connected and ready");
    } catch (err) {
      this.available = false;
      logger.warn(
        `[CourseQueue] Failed to connect — cache warming disabled: ${err}`
      );
    }
  }

  public async enqueue(job: CourseWarmJob): Promise<boolean> {
    if (!this.available || !this.channel) {
      return false;
    }

    return this.retry(() => {
      this.channel!.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), {
        persistent: true,
      });
    });
  }

  public enqueueWarmCourse(courseId: string): Promise<boolean> {
    return this.enqueue({
      type: "COURSE_DETAIL",
      courseId,
    });
  }

  public enqueueWarmCourseList(params: {
    teacherId?: string;
    year?: number;
    page: number;
    limit: number;
  }): Promise<boolean> {
    return this.enqueue({
      type: "COURSE_LIST",
      params,
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
            `[CourseQueue] Permanent failure after ${attempt} attempts: ${err}`
          );
          this.available = false;
          return false;
        }

        const delay = this.computeBackoff(attempt);

        logger.warn(
          `[CourseQueue] Transient failure, retrying in ${delay}ms (${attempt}/${this.maxRetries})`
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
}

export { CourseQueue };
export type { CourseWarmJob };
