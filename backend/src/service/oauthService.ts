/**
 * @file oauthService.ts
 * @description
 * OAuthService class that verifies Google and Microsoft ID tokens.
 * Includes safe .env validation for optional OAuth providers.
 *
 * @module service
 * @version 2.1.0
 * @auth Thomas
 */

import type { TokenPayload } from "google-auth-library";
import { OAuth2Client } from "google-auth-library";
import type { JwtHeader, JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { JwksClient } from "jwks-rsa";
import jwksClient from "jwks-rsa";
import env from "../config/envConfigs";
import { httpError, HttpError } from "../utility/httpUtility";
import logger from "../utility/logger";

interface GoogleUserInfo {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
}

class OAuthService {
  private readonly googleClient?: OAuth2Client;
  private readonly GOOGLE_CLIENT_ID?: string | null;
  private readonly MS_CLIENT_ID?: string | null;

  private readonly maxRetries = 3;
  private readonly baseDelay = 150;

  constructor() {
    this.GOOGLE_CLIENT_ID = env.google_client_id || null;
    this.MS_CLIENT_ID = env.ms_client_id || null;

    if (this.GOOGLE_CLIENT_ID) {
      this.googleClient = new OAuth2Client(this.GOOGLE_CLIENT_ID);
    }
  }

  private isTransient(err: any): boolean {
    if (!err) return false;

    const msg = (err.message || "").toLowerCase();
    return (
      msg.includes("timeout") ||
      msg.includes("network") ||
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("socket hang up") ||
      msg.includes("temporarily") ||
      msg.includes("fetch") ||
      msg.includes("jwks") ||
      msg.includes("dns")
    );
  }

  private async retry<T>(
    fn: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        return await fn();
      } catch (err: any) {
        if (!this.isTransient(err) || attempt >= this.maxRetries) {
          logger.error(
            `[OAuthService] Fatal error in ${operationName}: ${err?.message}`,
          );
          throw err;
        }

        const delay = Math.pow(2, attempt) * this.baseDelay * Math.random();

        logger.warn(
          `[OAuthService] Transient error in ${operationName}: ${err?.message}. ` +
            `Retrying in ${Math.round(delay)}ms (attempt ${
              attempt + 1
            }/${this.maxRetries})`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
      }
    }
  }

  private createJwksClient(issuer: string): JwksClient {
    try {
      if (!issuer) httpError(400, "Missing issuer");

      const tenantBase = issuer.replace(/\/v2\.0\/?$/, "");
      const jwksUri = `${tenantBase}/discovery/v2.0/keys`;

      return jwksClient({
        jwksUri,
        cache: true,
        cacheMaxEntries: 10,
        cacheMaxAge: 10 * 60 * 1000,
        timeout: 8000,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(`[OAuthService] createJwksClient failed: ${err?.message}`);
      httpError(500, "Internal server error");
    }
  }

  private async getSigningKey(
    client: JwksClient,
    header: JwtHeader,
  ): Promise<string> {
    return this.retry<string>(
      () =>
        new Promise((resolve, reject) => {
          if (!header.kid) return reject(new Error("Missing KID in header"));

          client.getSigningKey(header.kid, (err, key) => {
            if (err) return reject(err);

            const pubKey = (key as any)?.getPublicKey?.();
            if (!pubKey) return reject(new Error("Invalid public key"));

            resolve(pubKey);
          });
        }),
      "getSigningKey",
    );
  }

  async verifyMicrosoftToken(microsoftToken: string): Promise<JwtPayload> {
    try {
      if (!this.MS_CLIENT_ID) {
        httpError(503, "Microsoft client ID not configured");
      }

      if (!microsoftToken) httpError(400, "Missing Microsoft ID token");

      const decoded = jwt.decode(microsoftToken, { complete: true });
      if (!decoded || typeof decoded !== "object") {
        httpError(401, "Invalid Microsoft token");
      }

      const { header, payload } = decoded as {
        header: JwtHeader;
        payload: JwtPayload;
      };

      const { iss, aud } = payload;

      if (
        !iss ||
        !/^https:\/\/login\.microsoftonline\.com\/[^/]+\/v2\.0$/i.test(iss)
      ) {
        httpError(401, "Invalid issuer");
      }

      if (aud !== this.MS_CLIENT_ID) {
        httpError(401, "Audience mismatch");
      }

      const client = this.createJwksClient(iss);

      const publicKey = await this.getSigningKey(client, header);

      return await this.retry<JwtPayload>(
        () =>
          new Promise((resolve, reject) => {
            jwt.verify(
              microsoftToken,
              publicKey,
              {
                algorithms: ["RS256"],
                issuer: iss,
                audience: this.MS_CLIENT_ID!,
                clockTolerance: 5,
              },
              (err, verified) => {
                if (err)
                  return reject(httpError(401, "Invalid Microsoft Token"));

                const payload = verified as JwtPayload;
                if (!payload || (!payload.sub && !(payload as any).oid)) {
                  return reject(httpError(401, "Invalid Microsoft Token"));
                }

                resolve(payload);
              },
            );
          }),
        "msTokenVerify",
      );
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[OAuthService] verifyMicrosoftToken failed: ${err?.message}`,
      );
      httpError(500, "Internal server error");
    }
  }

  async verifyGoogleToken(googleToken: string): Promise<GoogleUserInfo> {
    try {
      if (!this.GOOGLE_CLIENT_ID) {
        httpError(503, "Google client ID not configured");
      }

      if (!this.googleClient) {
        httpError(503, "Google OAuth2 client not initialized");
      }

      if (!googleToken) httpError(400, "Missing Google ID token");

      const ticket = await this.retry(
        () =>
          this.googleClient!.verifyIdToken({
            idToken: googleToken,
            audience: this.GOOGLE_CLIENT_ID!,
          }),
        "googleTokenVerify",
      );

      const payload: TokenPayload | undefined = ticket.getPayload();
      if (!payload || !payload.sub) {
        httpError(401, "Invalid Google token payload");
      }

      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
      };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(`[OAuthService] verifyGoogleToken failed: ${err?.message}`);
      httpError(500, "Internal server error");
    }
  }

  async verifyAppleToken(appleToken: string) {
    httpError(503, "Apple OAuth is not available");
  }
}

export { OAuthService };
