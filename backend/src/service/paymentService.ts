import axios from "axios";
import env from "../config/envConfigs";
import logger from "../utility/logger";

const { paypal_client_id, paypal_secret_key, paypal_api, paypal_currency } =
  env;

interface PayPalOrderCapture {
  id: string;
  status: string;
  payer?: { email_address?: string };
  purchase_units?: Array<{ amount: { currency_code: string; value: string } }>;
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
      logger.error("Payment service is missing environment variables");
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
      logger.error(`[PayPal] Failed to generate access token: ${err.message}`);
      throw new Error("Failed to generate PayPal access token");
    }
  }

  async createOrder(amount: string): Promise<string> {
    const token = await this.generateAccessToken();

    const res = await axios.post(
      `${this.PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          { amount: { currency_code: this.PAYMENT_CURRENCY, value: amount } },
        ],
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return res.data.id;
  }

  async captureOrder(orderId: string): Promise<PayPalOrderCapture> {
    const token = await this.generateAccessToken();
    const res = await axios.post<PayPalOrderCapture>(
      `${this.PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data;
  }
}

export { PaymentService };
