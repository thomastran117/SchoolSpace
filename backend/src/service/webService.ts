/**
 * @file webService.ts
 * @description
 * Provides methods to verify Google reCAPTCHA tokens.
 *
 * @module service
 * @version 1.0.0
 * @auth Thomas
 */

import axios from "axios";
import env from "../config/envConfigs";

const {
  google_client_id: GOOGLE_CLIENT_ID,
  google_captcha_secret: GOOGLE_CAPTCHA_SECRET,
} = env;

interface GoogleCaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

export async function verifyGoogleCaptcha(token: string): Promise<boolean> {
  if (!GOOGLE_CAPTCHA_SECRET) {
    throw new Error("Missing GOOGLE_CAPTCHA_SECRET in environment");
  }

  const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

  try {
    const response = await axios.post<GoogleCaptchaResponse>(
      verifyUrl,
      new URLSearchParams({
        secret: GOOGLE_CAPTCHA_SECRET,
        response: token,
      }),
    );

    const data = response.data;

    if (data.success) {
      return true;
    } else {
      console.warn("Captcha verification failed:", data["error-codes"]);
      return false;
    }
  } catch (error: any) {
    console.error("Error verifying Google reCAPTCHA:", error.message);
    return false;
  }
}
