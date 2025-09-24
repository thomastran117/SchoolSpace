import { OAuth2Client } from "google-auth-library";
import config from "../../config/envManager.js";

const {
  google_client_id: GOOGLE_CLIENT_ID,
  google_client_secret: GOOGLE_CLIENT_SECRET,
  google_redirect_uri: GOOGLE_REDIRECT_URI,
} = config;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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
