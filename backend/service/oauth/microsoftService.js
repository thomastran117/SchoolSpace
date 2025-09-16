const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");
const config = require("../../config/envManager");
const { httpError } = require("../../utility/httpUtility");

const MS_TENANT_ID = config.ms_tenant_id;
const MS_CLIENT_ID = config.ms_client_id;

if (!MS_CLIENT_ID) {
  throw new Error("Missing ms_client_id in envManager");
}

const issuer = `https://login.microsoftonline.com/${MS_TENANT_ID}/v2.0`;
const jwksUri = `${issuer}/discovery/v2.0/keys`;

const client = jwksClient({
  jwksUri,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
  timeout: 8000,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

function verifyMicrosoftIdToken(idToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: [issuer],
        audience: MS_CLIENT_ID,
        clockTolerance: 5,
      },
      (err, decoded) => {
        if (err)
          return reject(
            httpError(401, `Invalid Microsoft id_token: ${err.message}`),
          );
        if (!decoded || (!decoded.sub && !decoded.oid)) {
          return reject(
            httpError(401, "Invalid Microsoft id_token: missing subject"),
          );
        }
        resolve(decoded);
      },
    );
  });
}

module.exports = { verifyMicrosoftIdToken };
