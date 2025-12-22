/**
 * @file webService.ts
 * @description
 * Provides general-purpose HTTP utilities and third-party API calls.
 * Includes consistent error logging and correct error propagation:
 *
 * - External service unreachable → 503
 * - External service returns error → 503
 * - Internal error → 500
 *
 * @module service
 * @version 2.0.1
 * @auth Thomas
 */

import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import env from "../config/envConfigs";
import { HttpError, httpError } from "../utility/httpUtility";
import logger from "../utility/logger";

const { googleCaptcha: GOOGLE_CAPTCHA_SECRET } = env;

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
    try {
      return await axios.post<T>(url, data, config);
    } catch (err: any) {
      this.handleAxiosError("POST", url, err);
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    try {
      return await axios.get<T>(url, config);
    } catch (err: any) {
      this.handleAxiosError("GET", url, err);
    }
  }

  async verifyGoogleCaptcha(token: string): Promise<boolean> {
    if (!GOOGLE_CAPTCHA_SECRET) {
      logger.warn("[WebService] Google Captcha is not available");
      return true;
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
    } catch (err: any) {
      logger.error(
        `[WebService] verifyGoogleCaptcha failed: ${err?.message ?? err}\n${err.stack || ""}`,
      );
      httpError(503, "Captcha verification unavailable");
    }
  }

  async requestPayPalToken(
    clientId: string,
    secret: string,
    apiUrl: string,
  ): Promise<string> {
    try {
      const resp = await axios.post<PayPalAuthResponse>(
        `${apiUrl}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          auth: { username: clientId, password: secret },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );
      return resp.data.access_token;
    } catch (err: any) {
      this.handleAxiosError(
        "requestPayPalToken",
        `${apiUrl}/v1/oauth2/token`,
        err,
      );
    }
  }

  async createPayPalOrder(
    token: string,
    apiUrl: string,
    currency: string,
    amount: string,
    returnUrl: string,
    cancelUrl: string,
  ): Promise<PayPalOrder> {
    try {
      const resp = await axios.post<PayPalOrder>(
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
      return resp.data;
    } catch (err: any) {
      this.handleAxiosError(
        "createPayPalOrder",
        `${apiUrl}/v2/checkout/orders`,
        err,
      );
    }
  }

  async capturePayPalOrder(token: string, apiUrl: string, orderId: string) {
    try {
      const resp = await axios.post(
        `${apiUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return resp.data;
    } catch (err: any) {
      this.handleAxiosError(
        "capturePayPalOrder",
        `${apiUrl}/v2/checkout/orders/${orderId}/capture`,
        err,
      );
    }
  }

  async cancelPayPalOrder(token: string, apiUrl: string, orderId: string) {
    try {
      const resp = await axios.post(
        `${apiUrl}/v2/checkout/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return resp.data;
    } catch (err: any) {
      this.handleAxiosError(
        "cancelPayPalOrder",
        `${apiUrl}/v2/checkout/orders/${orderId}/cancel`,
        err,
      );
    }
  }

  async getPayPalOrder(token: string, apiUrl: string, orderId: string) {
    try {
      const resp = await axios.get(`${apiUrl}/v2/checkout/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return resp.data;
    } catch (err: any) {
      this.handleAxiosError(
        "getPayPalOrder",
        `${apiUrl}/v2/checkout/orders/${orderId}`,
        err,
      );
    }
  }

  private handleAxiosError(method: string, url: string, err: any): never {
    const prefix = `[WebService] ${method} failed`;

    if (err instanceof HttpError) throw err;

    const isAxios = !!err.isAxiosError;
    const message = err?.message ?? String(err);
    const stack = err.stack || "";

    if (
      err.code === "ECONNREFUSED" ||
      err.code === "ENOTFOUND" ||
      err.code === "ETIMEDOUT"
    ) {
      logger.error(`${prefix}: ${message}\n${stack}`);
      httpError(503, "External service unavailable");
    }

    if (isAxios) {
      const status = err.response?.status;

      if (status && status >= 500) {
        logger.error(`${prefix}: ${message}\n${stack}`);
        httpError(503, "External service unavailable");
      }

      if (status && status >= 400 && status < 500) {
        logger.error(`${prefix}: ${message}\n${stack}`);
        httpError(503, "External service unavailable");
      }
    }

    logger.error(`${prefix}: ${message}\n${stack}`);
    httpError(500, "Internal server error");
  }
}

export { WebService };
