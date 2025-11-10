import axios from "axios";
import env from "../config/envConfigs";
import logger from "../utility/logger";

const { paypal_client_id, paypal_secret_key, paypal_api, paypal_currency } =
  env;

interface PayPalOrder {
  id: string;
  status: string;
  links?: Array<{ rel: string; href: string; method: string }>;
}

class PaymentService {
  private readonly PAYPAL_CLIENT_ID: string;
  private readonly PAYPAL_SECRET_KEY: string;
  private readonly PAYPAL_API: string;
  private readonly PAYMENT_CURRENCY: string;

  constructor() {
    if (
      !paypal_client_id ||
      !paypal_secret_key ||
      !paypal_api ||
      !paypal_currency
    ) {
      throw new Error("Missing PayPal environment variables");
    }

    this.PAYPAL_CLIENT_ID = paypal_client_id;
    this.PAYPAL_SECRET_KEY = paypal_secret_key;
    this.PAYPAL_API = paypal_api;
    this.PAYMENT_CURRENCY = paypal_currency;
  }

  private async generateAccessToken(): Promise<string> {
    try {
      const res = await axios.post(
        `${this.PAYPAL_API}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          auth: {
            username: this.PAYPAL_CLIENT_ID,
            password: this.PAYPAL_SECRET_KEY,
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );
      return res.data.access_token;
    } catch (err: any) {
      logger.error(`[PayPal] Failed to generate token: ${err.message}`);
      throw new Error("PayPal authentication failed");
    }
  }

  async createOrder(
    amount: string,
  ): Promise<{ id: string; approveLink: string }> {
    const token = await this.generateAccessToken();

    const res = await axios.post<PayPalOrder>(
      `${this.PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          { amount: { currency_code: this.PAYMENT_CURRENCY, value: amount } },
        ],
        application_context: {
          return_url: "http://localhost:8040/api/payment/success",
          cancel_url: "http://localhost:8040/api/payment/cancel",
        },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const approveLink =
      res.data.links?.find((l) => l.rel === "approve")?.href ?? "";

    return { id: res.data.id, approveLink };
  }

  async captureOrder(orderId: string) {
    const token = await this.generateAccessToken();
    const res = await axios.post(
      `${this.PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data;
  }

  async cancelOrder(orderId: string) {
    const token = await this.generateAccessToken();
    try {
      const res = await axios.post(
        `${this.PAYPAL_API}/v2/checkout/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data;
    } catch (err: any) {
      logger.warn(`[PayPal] Cancel order ${orderId} failed: ${err.message}`);
      throw new Error("PayPal cancellation failed");
    }
  }

  async getOrderDetails(orderId: string) {
    const token = await this.generateAccessToken();
    const res = await axios.get(
      `${this.PAYPAL_API}/v2/checkout/orders/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }
}

export { PaymentService };
