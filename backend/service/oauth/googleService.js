import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import config from "../../config/envManager.js";

const {
  google_client_id: GOOGLE_CLIENT_ID,
  google_client_secret: GOOGLE_CLIENT_SECRET,
  google_redirect_uri: GOOGLE_REDIRECT_URI,
} = config;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const b64url = (buf) =>
  buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest();

async function start() {
  const state = b64url(crypto.randomBytes(24));
  const codeVerifier = b64url(crypto.randomBytes(64));
  const codeChallenge = b64url(sha256(Buffer.from(codeVerifier)));

  const scope = ["openid", "email", "profile"].join(" ");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return { url, state, codeVerifier };
}

async function finish(callbackParams, expected) {
  const { code, state } = callbackParams;
  if (!code) {
    const e = new Error("missing code");
    e.statusCode = 400;
    throw e;
  }
  if (!state || state !== expected.state) {
    const e = new Error("state mismatch");
    e.statusCode = 400;
    throw e;
  }

  const body = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
    code,
    code_verifier: expected.codeVerifier,
  });

  if (GOOGLE_CLIENT_SECRET) {
    body.set("client_secret", GOOGLE_CLIENT_SECRET);
  }

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => "");
    const e = new Error(`token exchange failed: ${resp.status} ${msg}`);
    e.statusCode = 400;
    throw e;
  }

  const tokens = await resp.json();
  const { id_token: idToken } = tokens;
  if (!idToken) {
    const e = new Error("missing id_token from Google");
    e.statusCode = 400;
    throw e;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    const e = new Error("Google email missing");
    e.statusCode = 400;
    throw e;
  }
  if (payload.email_verified === false) {
    const e = new Error("Google email not verified");
    e.statusCode = 400;
    throw e;
  }

  const profile = {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || "",
    picture: payload.picture || null,
  };

  return { profile };
}

export { start, finish };
