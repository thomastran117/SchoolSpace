import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";
import config from "../../config/envManager.js";
import { httpError } from "../../utility/httpUtility.js";

const MS_CLIENT_ID = config.ms_client_id;

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

function getKeyFrom(client, header) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}

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

  return new Promise((resolve, reject) => {
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
        if (!verified?.sub && !verified?.oid)
          return reject(httpError(401, "Invalid Microsoft Token"));
        resolve(verified);
      },
    );
  });
}

export { verifyMicrosoftIdToken };
