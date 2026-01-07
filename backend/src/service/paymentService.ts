/**
 * @file paymentService.ts
 * @description
 * Handles PayPal payment creation, capture, cancellation, and retrieval.
 * All network logic is delegated to WebService.
 *
 * @module service
 * @version 2.0.0
 * @auth Thomas
 */
import env from "../config/envConfigs";
import logger from "../utility/logger";
import type { WebService } from "./webService";

const { paypalClient, paypalSecret, paypalApi, paypalCurrency } = env;

class PaymentService {
  private readonly PAYPAL_CLIENT_ID: string;
  private readonly PAYPAL_SECRET_KEY: string;
  private readonly PAYPAL_API: string;
  private readonly PAYMENT_CURRENCY: string;
  private readonly webService: WebService;

  constructor(dependencies: { webService: WebService }) {
    if (!paypalClient || !paypalSecret || !paypalApi || !paypalCurrency) {
      throw new Error("Missing PayPal environment variables");
    }
    this.PAYPAL_CLIENT_ID = paypalClient;
    this.PAYPAL_SECRET_KEY = paypalSecret;
    this.PAYPAL_API = paypalApi;
    this.PAYMENT_CURRENCY = paypalCurrency;
    this.webService = dependencies.webService;
  }

  private async getAccessToken(): Promise<string> {
    try {
      return await this.webService.requestPayPalToken(
        this.PAYPAL_CLIENT_ID,
        this.PAYPAL_SECRET_KEY,
        this.PAYPAL_API
      );
    } catch (err: any) {
      logger.error(`[PayPal] Failed to generate token: ${err.message}`);
      throw new Error("PayPal authentication failed");
    }
  }

  async createOrder(
    amount: string
  ): Promise<{ id: string; approveLink: string }> {
    const token = await this.getAccessToken();
    const order = await this.webService.createPayPalOrder(
      token,
      this.PAYPAL_API,
      this.PAYMENT_CURRENCY,
      amount,
      "http://localhost:9090/api/payment/success",
      "http://localhost:9090/api/payment/cancel"
    );

    const approveLink =
      order.links?.find((l) => l.rel === "approve")?.href ?? "";
    return { id: order.id, approveLink };
  }

  async captureOrder(orderId: string) {
    const token = await this.getAccessToken();
    return this.webService.capturePayPalOrder(token, this.PAYPAL_API, orderId);
  }

  async cancelOrder(orderId: string) {
    const token = await this.getAccessToken();
    try {
      return await this.webService.cancelPayPalOrder(
        token,
        this.PAYPAL_API,
        orderId
      );
    } catch (err: any) {
      logger.warn(`[PayPal] Cancel order ${orderId} failed: ${err.message}`);
      throw new Error("PayPal cancellation failed");
    }
  }

  async getOrderDetails(orderId: string) {
    const token = await this.getAccessToken();
    return this.webService.getPayPalOrder(token, this.PAYPAL_API, orderId);
  }
}

export { PaymentService };
