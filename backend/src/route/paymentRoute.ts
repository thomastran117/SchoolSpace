import type { Router, Request, Response, NextFunction } from "express";
import express from "express";
import container from "../resource/container";
import { validate } from "../middleware/validateMiddleware";
import { CreateOrderSchema, ViewOrderSchema } from "../dto/paymentSchema";
import type { PaymentController } from "../controller/paymentController";

const router: Router = express.Router();

const useScopedController =
  (
    handler: (
      controller: PaymentController,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<any> | any,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const scope = container.createScope();
    const controller = scope.resolve<PaymentController>("PaymentController");

    try {
      await handler(controller, req, res, next);
    } catch (err) {
      next(err);
    } finally {
      scope.dispose();
    }
  };

router.post(
  "/create",
  validate(CreateOrderSchema),
  useScopedController((controller, req, res, next) =>
    controller.createOrder(req, res, next),
  ),
);

router.get(
  "/success",
  useScopedController((controller, req, res, next) =>
    controller.approveOrder(req, res, next),
  ),
);

router.post(
  "/cancel",
  validate(ViewOrderSchema),
  useScopedController((controller, req, res, next) =>
    controller.cancelOrder(req, res, next),
  ),
);

router.post(
  "/status",
  validate(ViewOrderSchema),
  useScopedController((controller, req, res, next) =>
    controller.getOrderStatus(req, res, next),
  ),
);

router.get(
  "/admin/queue",
  useScopedController((controller, req, res, next) =>
    controller.getQueueSummary(req, res, next),
  ),
);

router.delete(
  "/admin/queue",
  useScopedController((controller, req, res, next) =>
    controller.flushQueue(req, res, next),
  ),
);

export default router;
