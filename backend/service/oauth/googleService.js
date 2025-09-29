/**
 * @file googleService.js
 * @description Google Service file that uses the OAuth client to validate Google Tokens
 *
 * @module service
 *
 * @author Thomas
 * @version 1.0.0
 *
 */

// External libraries
import { OAuth2Client } from "google-auth-library";

// Internal config & utilities
import config from "../../config/envManager.js";

const { google_client_id: GOOGLE_CLIENT_ID } = config;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token using Google's OAuth2 client.
 *
 * @async
 * @function verifyGoogleToken
 * @param {string} idToken - The Google ID token (JWT) obtained from the client.
 * @returns {Promise<{ email: string, name: string, picture: string, sub: string }>}
 * A payload object containing the verified Google user information.
 *
 * @throws {Error} If the token is invalid, expired, or verification fails.
 *
 * @example
 * const googleUser = await verifyGoogleToken(idToken);
 * console.log(googleUser.email, googleUser.name);
 */
export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  return {
    email: payload?.email,
    name: payload?.name,
    picture: payload?.picture,
    sub: payload?.sub,
  };
}
