/**
 * @file webService.ts
 * @description
 * Provides general-purpose HTTP utilities and third-party API methods
 * (e.g., Google reCAPTCHA, PayPal API interactions).
 *
 * @module service
 * @version 2.0.0
 * @auth Thomas
 */

import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import env from "../config/envConfigs";

const { google_captcha_secret: GOOGLE_CAPTCHA_SECRET } = env;

interface GoogleCaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

export interface PayPalAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PayPalOrderLink {
  rel: string;
  href: string;
  method: string;
}

export interface PayPalOrder {
  id: string;
  status: string;
  links?: PayPalOrderLink[];
}

class WebService {
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return axios.post<T>(url, data, config);
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return axios.get<T>(url, config);
  }

  async verifyGoogleCaptcha(token: string): Promise<boolean> {
    if (!GOOGLE_CAPTCHA_SECRET) {
      throw new Error("Missing GOOGLE_CAPTCHA_SECRET in environment");
    }

    try {
      const response = await axios.post<GoogleCaptchaResponse>(
        "https://www.google.com/recaptcha/api/siteverify",
        new URLSearchParams({
          secret: GOOGLE_CAPTCHA_SECRET,
          response: token,
        }),
      );
      return response.data.success === true;
    } catch {
      return false;
    }
  }

  async requestPayPalToken(
    clientId: string,
    secret: string,
    apiUrl: string,
  ): Promise<string> {
    const response = await axios.post<PayPalAuthResponse>(
      `${apiUrl}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: { username: clientId, password: secret },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );
    return response.data.access_token;
  }

  async createPayPalOrder(
    token: string,
    apiUrl: string,
    currency: string,
    amount: string,
    returnUrl: string,
    cancelUrl: string,
  ): Promise<PayPalOrder> {
    const response = await axios.post<PayPalOrder>(
      `${apiUrl}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          { amount: { currency_code: currency, value: amount } },
        ],
        application_context: { return_url: returnUrl, cancel_url: cancelUrl },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  }

  async capturePayPalOrder(token: string, apiUrl: string, orderId: string) {
    const response = await axios.post(
      `${apiUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  }

  async cancelPayPalOrder(token: string, apiUrl: string, orderId: string) {
    const response = await axios.post(
      `${apiUrl}/v2/checkout/orders/${orderId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  }

  async getPayPalOrder(token: string, apiUrl: string, orderId: string) {
    const response = await axios.get(
      `${apiUrl}/v2/checkout/orders/${orderId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  }
}

export { WebService };
