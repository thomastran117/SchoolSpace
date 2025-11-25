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

  constructor() {
    this.GOOGLE_CLIENT_ID = env.google_client_id || null;
    this.MS_CLIENT_ID = env.ms_client_id || null;

    if (this.GOOGLE_CLIENT_ID) {
      this.googleClient = new OAuth2Client(this.GOOGLE_CLIENT_ID);
    }
  }

  /**
   * Create a JWKS client for a given Microsoft issuer (tenant).
   */
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
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[OAuthService] createJwksClient failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  /**
   * Retrieve the public key from JWKS given a JWT header.
   */
  private async getSigningKey(
    client: JwksClient,
    header: JwtHeader,
  ): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        if (!header.kid) return reject(new Error("Missing KID in header"));
        client.getSigningKey(header.kid, (err, key) => {
          if (err) return reject(err);
          if (!key || typeof (key as any).getPublicKey !== "function") {
            return reject(new Error("Invalid signing key"));
          }
          try {
            const pubKey = (key as any).getPublicKey();
            if (!pubKey || typeof pubKey !== "string") {
              return reject(new Error("Invalid public key"));
            }
            resolve(pubKey);
          } catch (e) {
            reject(e);
          }
        });
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[OAuthService] getSigningKey failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  /**
   * Verify a Microsoft ID token (JWT) using JWKS.
   * Checks if MS_CLIENT_ID is defined in .env before verifying.
   */
  async verifyMicrosoftToken(microsoftToken: string): Promise<JwtPayload> {
    try {
      if (!this.MS_CLIENT_ID) {
        httpError(503, "Microsoft client ID not configured in environment");
      }

      if (!microsoftToken || typeof microsoftToken !== "string") {
        httpError(400, "Missing or invalid id_token");
      }

      const decoded = jwt.decode(microsoftToken, { complete: true });
      if (
        !decoded ||
        typeof decoded !== "object" ||
        !decoded.header ||
        !decoded.payload
      ) {
        httpError(401, "Invalid Microsoft token: cannot decode");
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
        httpError(401, "Invalid issuer in token");
      }

      if (aud !== this.MS_CLIENT_ID) {
        httpError(401, "Audience mismatch");
      }

      const client = this.createJwksClient(iss);
      const publicKey = await this.getSigningKey(client, header);

      return new Promise<JwtPayload>((resolve, reject) => {
        jwt.verify(
          microsoftToken,
          publicKey,
          {
            algorithms: ["RS256"],
            issuer: iss,
            audience: this.MS_CLIENT_ID as string,
            clockTolerance: 5,
          },
          (err, verified) => {
            if (err) return reject(httpError(401, "Invalid Microsoft Token"));

            const payload = verified as JwtPayload | undefined;
            if (!payload || (!payload.sub && !(payload as any).oid)) {
              return reject(httpError(401, "Invalid Microsoft Token"));
            }

            resolve(payload);
          },
        );
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[OAuthService] verifyMicrosoftToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  /**
   * Verify a Google ID token using Google's OAuth2Client.
   * Checks if GOOGLE_CLIENT_ID is defined in .env before verifying.
   */
  async verifyGoogleToken(googleToken: string): Promise<GoogleUserInfo> {
    try {
      if (!this.GOOGLE_CLIENT_ID) {
        httpError(503, "Google client ID not configured in environment");
      }

      if (!this.googleClient) {
        httpError(503, "Google OAuth2 client not initialized");
      }

      if (!googleToken || typeof googleToken !== "string") {
        httpError(400, "Missing or invalid Google ID token");
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleToken,
        audience: this.GOOGLE_CLIENT_ID,
      });

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
      if (err instanceof HttpError) {
        throw err;
      }
      logger.error(
        `[OAuthService] verifyGoogleToken failed: ${err?.message ?? err}`,
      );
      httpError(500, "Internal server error");
    }
  }

  async verifyAppleToken(appleToken: string) {
    httpError(503, "Apple OAuth is not avaliable");
  }
}

export { OAuthService };
