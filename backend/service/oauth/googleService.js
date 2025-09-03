const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const assert = require("assert");

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
  process.env;

assert(GOOGLE_CLIENT_ID, "Missing GOOGLE_CLIENT_ID");
assert(GOOGLE_REDIRECT_URI, "Missing GOOGLE_REDIRECT_URI");

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

  // Minimal OIDC scopes
  const scope = ["openid", "email", "profile"].join(" ");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline", // allow refresh_token
    prompt: "consent", // ensure refresh_token on repeat auths
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

  // Exchange the code using PKCE
  const body = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
    code,
    code_verifier: expected.codeVerifier,
  });

  // For confidential web apps you can also include client_secret:
  if (process.env.GOOGLE_CLIENT_SECRET) {
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

  // Verify the ID Token and extract the user profile
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload(); // https://developers.google.com/identity/openid-connect/openid-connect#obtainuserinfo
  // payload has: sub, email, email_verified, name, picture, given_name, family_name, etc.

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

module.exports = { start, finish };
