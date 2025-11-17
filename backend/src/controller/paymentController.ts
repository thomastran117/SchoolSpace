import type { NextFunction, Response } from "express";
import type { CreateOrderDto, ViewOrderDto } from "../dto/paymentSchema";
import { paymentQueue } from "../queues/paymentQueue";
import { isWorkerHealthy } from "../resource/workerHealth";
import type { PaymentService } from "../service/paymentService";
import type { TypedRequest } from "../types/express";
import { HttpError } from "../utility/httpUtility";
import logger from "../utility/logger";

class PaymentController {
  private readonly paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  public async createOrder(
    req: TypedRequest<CreateOrderDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const healthy = await isWorkerHealthy();
      if (!healthy) {
        logger.warn("[Payment] Worker not available — blocking operation.");
        return res.status(503).json({
          error:
            "Payment worker is currently offline. Please try again shortly.",
        });
      }
      const { amount } = req.body;
      const result = await this.paymentService.createOrder(amount);

      logger.info(`[Payment] Created PayPal order ${result.id}`);
      res.json({
        message: "PayPal order created successfully.",
        paypalOrderId: result.id,
        approveLink: result.approveLink,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[PaymentController] createOrder failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async approveOrder(req: any, res: Response, next: NextFunction) {
    try {
      const healthy = await isWorkerHealthy();
      if (!healthy) {
        logger.warn("[Payment] Worker not available — blocking operation.");
        return res.status(503).json({
          error:
            "Payment worker is currently offline. Please try again shortly.",
        });
      }
      const { token } = req.query;
      if (!token) return res.status(400).json({ error: "Missing order token" });

      const orderId = token as string;
      const details = await this.paymentService.getOrderDetails(orderId);

      if (details.status !== "APPROVED") {
        return res
          .status(400)
          .json({ error: `Order not approved. Status: ${details.status}` });
      }

      const delayMinutes = 5;
      await paymentQueue.add(
        "capture_payment",
        { paypalOrderId: orderId },
        {
          jobId: orderId,
          delay: delayMinutes * 60 * 1000,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      logger.info(
        `[Payment] Queued approved order ${orderId} for delayed capture (${delayMinutes}m)`,
      );

      res.json({
        message: `Order approved and queued for capture in ${delayMinutes} minutes.`,
        paypalOrderId: orderId,
        graceMinutes: delayMinutes,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[PaymentController] approveOrder failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async cancelOrder(
    req: TypedRequest<ViewOrderDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const healthy = await isWorkerHealthy();
      if (!healthy) {
        logger.warn("[Payment] Worker not available — blocking operation.");
        return res.status(503).json({
          error:
            "Payment worker is currently offline. Please try again shortly.",
        });
      }
      const { orderId } = req.body;

      const job = await paymentQueue.getJob(orderId);
      if (!job) {
        return res
          .status(404)
          .json({ message: "Order not found or already processed." });
      }

      await job.remove();
      await this.paymentService.cancelOrder(orderId);

      logger.info(`[Payment] Cancelled order ${orderId} successfully`);
      res.json({ message: `Order ${orderId} cancelled.` });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[PaymentController] cancelOrder failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async getOrderStatus(
    req: TypedRequest<ViewOrderDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const healthy = await isWorkerHealthy();
      if (!healthy) {
        logger.warn("[Payment] Worker not available — blocking operation.");
        return res.status(503).json({
          error:
            "Payment worker is currently offline. Please try again shortly.",
        });
      }
      const { orderId } = req.body;
      const job = await paymentQueue.getJob(orderId);

      if (job) {
        const state = await job.getState();
        return res.json({
          source: "queue",
          orderId,
          state,
          createdAt: new Date(job.timestamp).toISOString(),
        });
      }

      const order = await this.paymentService.getOrderDetails(orderId);
      return res.json({
        source: "paypal",
        orderId,
        status: order.status,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[PaymentController] getOrderStatus failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async getQueueSummary(req: any, res: Response, next: NextFunction) {
    try {
      const counts = await paymentQueue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
        "paused",
      );

      const delayed = await paymentQueue.getDelayed();
      const waiting = await paymentQueue.getWaiting();

      const serializeJob = (job: any) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        delay: job.opts.delay,
        timestamp: new Date(job.timestamp).toISOString(),
        state: job.state,
      });

      res.json({
        counts,
        delayed: delayed.map(serializeJob),
        waiting: waiting.map(serializeJob),
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[PaymentController] getQueueSummary failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async flushQueue(req: any, res: Response, next: NextFunction) {
    try {
      const countsBefore = await paymentQueue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
        "paused",
      );

      await paymentQueue.drain(true);
      await paymentQueue.clean(0, 10000, "completed");
      await paymentQueue.clean(0, 10000, "failed");

      logger.warn(`[Admin] Queue flushed by admin user`);

      res.json({
        message: "Payment queue has been flushed.",
        previousCounts: countsBefore,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[PaymentController] flushQueue failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }
}

export { PaymentController };
