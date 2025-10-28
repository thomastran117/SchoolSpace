/**
 * @file googleService.ts
 * @description
 * Provides methods to validate Google ID tokens (OAuth2) and verify Google reCAPTCHA tokens.
 *
 * @module service
 * @version 1.0.0
 * @auth Thomas
 */

import { OAuth2Client, TokenPayload } from "google-auth-library";
import axios from "axios";
import config from "../../config/envManager";

const {
  google_client_id: GOOGLE_CLIENT_ID,
  google_captcha_secret: GOOGLE_CAPTCHA_SECRET,
} = config;

if (!GOOGLE_CLIENT_ID) {
  throw new Error("Missing GOOGLE_CLIENT_ID in environment");
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Represents the verified Google user information from an ID token.
 */
export interface GoogleUserInfo {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
}

/**
 * Represents the Google reCAPTCHA verification API response.
 */
interface GoogleCaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

/**
 * Verifies a Google ID token using the Google OAuth2 client.
 *
 * @param idToken - The Google ID token (JWT) obtained from the client.
 * @returns A payload containing verified user information.
 * @throws If the token is invalid, expired, or verification fails.
 *
 * @example
 * const googleUser = await verifyGoogleToken(idToken);
 * console.log(googleUser.email, googleUser.name);
 */
export async function verifyGoogleToken(
  idToken: string,
): Promise<GoogleUserInfo> {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Missing or invalid Google ID token");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload: TokenPayload | undefined = ticket.getPayload();

  if (!payload || !payload.sub) {
    throw new Error("Invalid Google token payload");
  }

  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    sub: payload.sub,
  };
}

/**
 * Verifies a Google reCAPTCHA token with the official Google API.
 *
 * @param token - The reCAPTCHA response token received from the client.
 * @returns True if the captcha is valid, false otherwise.
 *
 * @example
 * const isValid = await verifyGoogleCaptcha(token);
 * if (!isValid) throw new Error("Captcha validation failed");
 */
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
