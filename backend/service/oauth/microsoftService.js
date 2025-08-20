import 'dotenv/config';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import { Issuer, generators } from 'openid-client';
import { SignJWT, jwtVerify } from 'jose';

const {
  CLIENT_APP_URL,
  MS_TENANT_ID,
  MS_CLIENT_ID,
  MS_CLIENT_SECRET,
  MS_REDIRECT_URI,
  API_JWT_SECRET,
  COOKIE_NAME = 'api_token',
} = process.env;

const app = express();

const msIssuer = await Issuer.discover(`https://login.microsoftonline.com/${MS_TENANT_ID}/v2.0`);
const oidc = new msIssuer.Client({
  client_id: MS_CLIENT_ID,
  client_secret: MS_CLIENT_SECRET,
  redirect_uris: [MS_REDIRECT_URI],
  response_types: ['code'],
});

async function mintApiJwt(payload) {
  const key = new TextEncoder().encode(API_JWT_SECRET);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key);
}

async function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.split(' ')[1];
    const token = bearer || req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    const key = new TextEncoder().encode(API_JWT_SECRET);
    const { payload } = await jwtVerify(token, key);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

function setTempCookie(res, name, value) {
  res.cookie(name, value, {
    httpOnly: true, secure: false, sameSite: 'lax', maxAge: 5 * 60 * 1000, // 5 min
  });
}
function getAndClearTempCookie(req, res, name) {
  const val = req.cookies[name];
  res.clearCookie(name);
  return val;
}

app.get('/auth/microsoft/start', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);

  setTempCookie(res, 'ms_state', state);
  setTempCookie(res, 'ms_code_verifier', codeVerifier);

  const url = oidc.authorizationUrl({
    scope: 'openid profile email offline_access User.Read',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });
  res.redirect(url);
});

app.get('/auth/microsoft/callback', async (req, res, next) => {
  try {
    const params = oidc.callbackParams(req);
    const expectedState = getAndClearTempCookie(req, res, 'ms_state');
    const codeVerifier = getAndClearTempCookie(req, res, 'ms_code_verifier');

    if (!expectedState || params.state !== expectedState) {
      return res.status(400).send('Invalid state');
    }

    const tokenSet = await oidc.callback(MS_REDIRECT_URI, params, { code_verifier: codeVerifier });
    const claims = tokenSet.claims();

    const apiJwt = await mintApiJwt({
      sub: claims.sub,
      email: claims.email || claims.preferred_username,
      name: claims.name,
      iss: 'your-api',
    });

    res.cookie(COOKIE_NAME, apiJwt, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.redirect(`${CLIENT_APP_URL}/auth/signed-in`);
  } catch (e) {
    next(e);
  }
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.status(204).end();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'server_error' });
});

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
