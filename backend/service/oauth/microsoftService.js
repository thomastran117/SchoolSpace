/**
 * @file microsoftService.js
 * @description Microsoft Service file that uses the OAuth client to validate Microsoft Tokens
 *
 * @module service
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";

// Internal config & utilities
import config from "../../config/envManager.js";
import { httpError } from "../../utility/httpUtility.js";

const MS_CLIENT_ID = config.ms_client_id;

/**
 * Creates a JWKS client for a given Microsoft issuer.
 *
 * @param {string} iss - The token issuer URL (Microsoft tenant).
 * @returns {import("jwks-rsa").JwksClient} A configured JWKS client.
 * @throws {Error} If issuer is missing.
 */
function clientForIssuer(iss) {
  if (!iss) throw new Error("Missing issuer");
  const tenantBase = iss.replace(/\/v2\.0\/?$/, "");
  const jwksUri = `${tenantBase}/discovery/v2.0/keys`;
  return jwksClient({
    jwksUri,
    cache: true,
    cacheMaxEntries: 10,
    cacheMaxAge: 10 * 60 * 1000,
    timeout: 8000,
  });
}

/**
 * Retrieves the signing public key for a given JWT header.
 *
 * @param {import("jwks-rsa").JwksClient} client - JWKS client.
 * @param {object} header - JWT header containing the key ID (`kid`).
 * @returns {Promise<string>} The public key as a PEM string.
 */
function getKeyFrom(client, header) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}

/**
 * Verifies a Microsoft ID token (id_token) against Azure AD.
 *
 * @async
 * @function verifyMicrosoftIdToken
 * @param {string} idToken - Microsoft OAuth/OpenID ID token (JWT).
 * @returns {Promise<object>} The verified token payload (claims).
 *
 * @throws {Error} If token is missing, malformed, has an invalid issuer,
 *                 mismatched audience, or fails signature verification.
 *
 * @example
 * const claims = await verifyMicrosoftIdToken(idToken);
 * console.log(claims.email, claims.sub);
 */
async function verifyMicrosoftIdToken(idToken) {
  if (!idToken || typeof idToken !== "string") {
    throw httpError(400, "Missing or invalid id_token");
  }

  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded?.header || !decoded?.payload) {
    throw httpError(401, "Invalid Microsoft token: cannot decode");
  }

  const { header, payload } = decoded;
  const { iss, aud } = payload;

  // Validate issuer (must match Microsoft tenant format)
  if (
    !iss ||
    !/^https:\/\/login\.microsoftonline\.com\/[^/]+\/v2\.0$/i.test(iss)
  ) {
    throw httpError(401, "Invalid issuer in token");
  }

  // Validate audience (must match our app's MS client ID)
  if (aud !== MS_CLIENT_ID) {
    throw httpError(401, "Audience mismatch");
  }

  const client = clientForIssuer(iss);
  const publicKey = await getKeyFrom(client, header);

  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      publicKey,
      {
        algorithms: ["RS256"],
        issuer: iss,
        audience: MS_CLIENT_ID,
        clockTolerance: 5, // allow minor clock skew
      },
      (err, verified) => {
        if (err) return reject(httpError(401, "Invalid Microsoft Token"));
        if (!verified?.sub && !verified?.oid) {
          return reject(httpError(401, "Invalid Microsoft Token"));
        }
        resolve(verified);
      },
    );
  });
}

export { verifyMicrosoftIdToken };
