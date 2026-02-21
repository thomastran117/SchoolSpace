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
import env from "@config/envConfigs";
import { BadRequestError } from "@error/badRequestError";
import { HttpError } from "@error/httpError";
import { InternalServerError } from "@error/internalServerError";
import { NotImplementedError } from "@error/notImplementedError";
import { ServiceUnavaliableError } from "@error/serviceUnavaliableError";
import { UnauthorizedError } from "@error/unauthorizedError";
import logger from "@utility/logger";
import type { TokenPayload } from "google-auth-library";
import { OAuth2Client } from "google-auth-library";
import type { JwtHeader, JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { JwksClient } from "jwks-rsa";
import jwksClient from "jwks-rsa";

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
    this.GOOGLE_CLIENT_ID = env.googleClient || null;
    this.MS_CLIENT_ID = env.microsoftClient || null;

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
    operationName: string
  ): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        return await fn();
      } catch (err: any) {
        if (!this.isTransient(err) || attempt >= this.maxRetries) {
          logger.error(
            `[OAuthService] Fatal error in ${operationName}: ${err?.message}`
          );
          throw err;
        }

        const delay = Math.pow(2, attempt) * this.baseDelay * Math.random();

        logger.warn(
          `[OAuthService] Transient error in ${operationName}: ${err?.message}. ` +
            `Retrying in ${Math.round(delay)}ms (attempt ${
              attempt + 1
            }/${this.maxRetries})`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
      }
    }
  }

  private createJwksClient(issuer: string): JwksClient {
    try {
      if (!issuer) throw new BadRequestError({ message: "Missing issuer" });

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
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  private async getSigningKey(
    client: JwksClient,
    header: JwtHeader
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
      "getSigningKey"
    );
  }

  async verifyMicrosoftToken(microsoftToken: string): Promise<JwtPayload> {
    try {
      if (!this.MS_CLIENT_ID) {
        throw new ServiceUnavaliableError({
          message: "Microsoft service is unavaliable",
        });
      }

      if (!microsoftToken)
        throw new BadRequestError({ message: "Missing Microsoft token" });

      const decoded = jwt.decode(microsoftToken, { complete: true });
      if (!decoded || typeof decoded !== "object") {
        throw new UnauthorizedError({ message: "Invalid Microsoft token" });
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
        throw new UnauthorizedError({ message: "Invalid Microsoft token" });
      }

      if (aud !== this.MS_CLIENT_ID) {
        throw new UnauthorizedError({ message: "Invalid Microsoft token" });
      }

      const client = this.createJwksClient(iss);

      const publicKey = await this.getSigningKey(client, header);

      return await this.retry<JwtPayload>(
        () =>
          new Promise((resolve) => {
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
                  throw new UnauthorizedError({
                    message: "Invalid Microsoft token",
                  });

                const payload = verified as JwtPayload;
                if (!payload || (!payload.sub && !(payload as any).oid)) {
                  throw new UnauthorizedError({
                    message: "Invalid Microsoft token",
                  });
                }

                resolve(payload);
              }
            );
          }),
        "msTokenVerify"
      );
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[OAuthService] verifyMicrosoftToken failed: ${err?.message}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  async verifyGoogleToken(googleToken: string): Promise<GoogleUserInfo> {
    try {
      if (!this.GOOGLE_CLIENT_ID) {
        throw new ServiceUnavaliableError({
          message: "Google service is unavaliable",
        });
      }

      if (!this.googleClient) {
        throw new ServiceUnavaliableError({
          message: "Google service is unavaliable",
        });
      }

      if (!googleToken)
        throw new BadRequestError({ message: "Missing Google token" });

      const ticket = await this.retry(
        () =>
          this.googleClient!.verifyIdToken({
            idToken: googleToken,
            audience: this.GOOGLE_CLIENT_ID!,
          }),
        "googleTokenVerify"
      );

      const payload: TokenPayload | undefined = ticket.getPayload();
      if (!payload || !payload.sub) {
        throw new UnauthorizedError({
          message: "Invalid Google token payload",
        });
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
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  async verifyAppleToken(appleToken: string) {
    throw new NotImplementedError({
      message: "Apple OAuth is not implemented",
    });
  }
}

export { OAuthService };
export default OAuthService;
