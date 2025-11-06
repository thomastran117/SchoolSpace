/**
 * @file microsoftService.ts
 * @description
 * Microsoft Service that uses JWKS + JWT to validate Microsoft ID tokens (id_token)
 * from the OAuth / OpenID Connect flow.
 *
 * @module service
 * @version 1.0.0
 * @auth Thomas
 */

import jwksClient, { JwksClient } from "jwks-rsa";
import jwt, { JwtHeader, JwtPayload } from "jsonwebtoken";
import env from "../../config/envConfigs";
import { httpError } from "../../utility/httpUtility";

const MS_CLIENT_ID = env.ms_client_id;

/**
 * Creates a JWKS client for a given Microsoft issuer.
 *
 * @param iss - The token issuer URL (Microsoft tenant).
 * @returns A configured JWKS client instance.
 * @throws If issuer is missing or invalid.
 */
function clientForIssuer(iss: string): JwksClient {
  if (!iss) throw new Error("Missing issuer");
  const tenantBase = iss.replace(/\/v2\.0\/?$/, "");
  const jwksUri = `${tenantBase}/discovery/v2.0/keys`;
  return jwksClient({
    jwksUri,
    cache: true,
    cacheMaxEntries: 10,
    cacheMaxAge: 10 * 60 * 1000, // 10 minutes
    timeout: 8000,
  });
}

/**
 * Retrieves the signing public key for a given JWT header from the JWKS endpoint.
 *
 * @param client - JWKS client instance.
 * @param header - JWT header containing the key ID (`kid`).
 * @returns The PEM public key string.
 */
async function getKeyFrom(
  client: JwksClient,
  header: JwtHeader,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!header.kid) return reject(new Error("Missing KID in header"));
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      if (!key || typeof (key as any).getPublicKey !== "function") {
        return reject(new Error("Signing key not found or invalid"));
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
}

/**
 * Verifies a Microsoft ID token (id_token) using JWKS and validates:
 * - Signature via public key
 * - Issuer format
 * - Audience (client ID)
 *
 * @param idToken - Microsoft OAuth/OpenID ID token (JWT).
 * @returns The verified token payload (claims).
 * @throws If token is missing, malformed, or fails validation.
 *
 * @example
 * const claims = await verifyMicrosoftIdToken(idToken);
 * console.log(claims.email, claims.sub);
 */
export async function verifyMicrosoftIdToken(
  idToken: string,
): Promise<JwtPayload> {
  if (!idToken || typeof idToken !== "string") {
    throw httpError(400, "Missing or invalid id_token");
  }

  const decoded = jwt.decode(idToken, { complete: true });
  if (
    !decoded ||
    typeof decoded !== "object" ||
    !decoded.header ||
    !decoded.payload
  ) {
    throw httpError(401, "Invalid Microsoft token: cannot decode");
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
    throw httpError(401, "Invalid issuer in token");
  }

  if (aud !== MS_CLIENT_ID) {
    throw httpError(401, "Audience mismatch");
  }

  const client = clientForIssuer(iss);
  const publicKey = await getKeyFrom(client, header);

  return new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(
      idToken,
      publicKey,
      {
        algorithms: ["RS256"],
        issuer: iss,
        audience: MS_CLIENT_ID,
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
}
