
let OIDC;
let Issuer, generators;
let _client;

async function loadOIDC() {
  if (!OIDC) {
    OIDC = await import('openid-client');
    ({ Issuer, generators } = OIDC);
  }
}

async function ensureClient() {
  await loadOIDC();
  if (_client) return _client;

  const { MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REDIRECT_URI } = process.env;
  if (!MS_TENANT_ID || !MS_CLIENT_ID || !MS_REDIRECT_URI) {
    throw new Error('Missing MS_TENANT_ID / MS_CLIENT_ID / MS_REDIRECT_URI env vars');
  }

  const issuer = await Issuer.discover(`https://login.microsoftonline.com/${MS_TENANT_ID}/v2.0`);
  _client = new issuer.Client({
    client_id: MS_CLIENT_ID,
    client_secret: MS_CLIENT_SECRET,
    redirect_uris: [MS_REDIRECT_URI],
    response_types: ['code'],
  });
  return _client;
}

module.exports = {
  async start() {
    const client = await ensureClient();
    const state = generators.state();
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    const url = client.authorizationUrl({
      scope: 'openid profile email offline_access User.Read',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    });

    return { url, state, codeVerifier };
  },

  async finish(callbackParams, expected) {
    await loadOIDC();
    const client = await ensureClient();

    const { state, codeVerifier } = expected;
    if (!callbackParams.state || callbackParams.state !== state) {
      const e = new Error('Invalid state');
      e.statusCode = 400;
      throw e;
    }

    const tokenSet = await client.callback(process.env.MS_REDIRECT_URI, callbackParams, {
      code_verifier: codeVerifier,
    });

    const claims = tokenSet.claims();
    return {
      sub: claims.sub,
      email: claims.email || claims.preferred_username,
      name: claims.name || '',
    };
  },
};
