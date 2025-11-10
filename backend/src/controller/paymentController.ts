import type { Response, NextFunction } from "express";
import type { PaymentService } from "../service/paymentService";
import type { TypedRequest } from "../types/express";
import type { ViewOrderDto, CreateOrderDto } from "../dto/paymentSchema";

class PaymentController {
  private readonly paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
    this.createOrder = this.createOrder.bind(this);
    this.viewOrder = this.viewOrder.bind(this);
  }

  public async createOrder(
    req: TypedRequest<CreateOrderDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { amount } = req.body;
      const orderId = await this.paymentService.createOrder(amount);
      res.json({ orderId });
      return;
    } catch (err) {
      next(err);
    }
  }

  public async viewOrder(
    req: TypedRequest<ViewOrderDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { orderId } = req.body;
      const result = await this.paymentService.captureOrder(orderId);
      res.json(result);
      return;
    } catch (err) {
      next(err);
    }
  }
}

export { PaymentController };
