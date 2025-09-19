const bcrypt = require("bcrypt");
const prisma = require("../resource/prisma");
const { createToken } = require("./tokenService");
const { verifyMicrosoftIdToken } = require("./oauth/microsoftService");
const googleOAuth = require("./oauth/googleService");
const redis = require("../resource/redis");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
} = require("../service/emailService");
const { randomBytes } = require("crypto");
const jwt = require("jsonwebtoken");
const { httpError } = require("../utility/httpUtility");
const config = require("../config/envManager");
const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");
const config = require("../../config/envManager");
const { httpError } = require("../../utility/httpUtility");

const { frontend_client: FRONTEND_CLIENT, jwt_secret_2: JWT_SECRET_2, ms_client_id: MS_CLIENT_ID } = config;

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    httpError(401, "Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    httpError(401, "Invalid credentials");
  }

  const token = await createToken(user.id, user.email, user.role);
  return { token: token, role: user.role };
};

const signupUser = async (email, password, role) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    httpError(409, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const jti = randomBytes(32).toString("base64url");

  await redis.set(
    `verify:${jti}`,
    JSON.stringify({ email, passwordHash: hashedPassword, role }),
    "EX",
    15 * 60,
  );

  const token = jwt.sign(
    { sub: email, jti, purpose: "email-verify" },
    JWT_SECRET_2,
    { expiresIn: "15m" },
  );

  const url = `${FRONTEND_CLIENT}/verify?token=${encodeURIComponent(token)}`;
  await sendVerificationEmail(email, url);
  return { message: "Verification email sent" };
};

const verifyUser = async (token) => {
  const payload = jwt.verify(token, JWT_SECRET_2);
  if (payload.purpose !== "email-verify") {
    const error = new Error("Invalid token purpose");
    error.statusCode = 400;
    throw error;
  }

  let pendingStr;
  if (typeof redis.getdel === "function") {
    pendingStr = await redis.getdel(`verify:${payload.jti}`);
  } else {
    const [[, val]] = await redis
      .multi()
      .get(`verify:${payload.jti}`)
      .del(`verify:${payload.jti}`)
      .exec();
    pendingStr = val;
  }

  if (!pendingStr) {
    httpError(400, "Token missing or used");
  }

  let data;
  try {
    data = JSON.parse(pendingStr);
  } catch {
    httpError(400, "Corrupted token");
  }

  const { email, passwordHash, role } = data;
  if (email !== payload.sub) {
    httpError(401, "Email mismatch");
  }

  try {
    const user = await prisma.user.create({
      data: { email, password: passwordHash, role },
    });
    await sendWelcomeEmail(email);
    return user;
  } catch (e) {
    if (e && e.code === "P2002") return { message: "Already verified" };
    httpError(400, "Token unable to be used");
  } finally {
    await redis.setex(`used:${payload.jti}`, 24 * 60 * 60, "1");
  }
};

const verifyMicrosoftIdTokenAndSignIn = async (idToken) => {
  const claims = await verifyMicrosoftIdToken(idToken);

  const microsoftSub = claims.sub || claims.oid;
  const email = claims.email || claims.preferred_username;
  const name = claims.name || "";

  if (!email) throw httpError(400, "Microsoft email missing");
  if (!microsoftSub) throw httpError(400, "Microsoft subject missing");

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.findFirst({
      where: { microsoftId: microsoftSub },
    });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        provider: "microsoft",
        password: null,
        microsoftId: microsoftSub,
        role: "notdefined",
      },
    });
  } else if (!user.microsoftId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        microsoftId: microsoftSub,
        provider: "microsoft",
        name: user.name || name,
      },
    });
  }

  const token = await createToken(user.id, user.email, user.role);

  return {
    token,
    role: user.role,
    user: { id: user.id, email: user.email, name: user.name },
  };
};

const startGoogleOAuth = async () => {
  return googleOAuth.start();
};

const finishGoogleOAuth = async (callbackParams, expected) => {
  const { profile } = await googleOAuth.finish(callbackParams, expected);

  let user = await prisma.user.findUnique({ where: { email: profile.email } });

  if (!user) {
    user = await prisma.user.findFirst({ where: { googleId: profile.sub } });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        provider: "google",
        password: null,
        googleId: profile.sub,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: profile.sub,
        provider: "google",
        name: user.name || profile.name,
        avatar: user.avatar || profile.picture,
        role: "notdefined",
      },
    });
  }

  const token = await createToken(user.id, user.email, user.role);
  return {
    token,
    role: user.role,
    user: { id: user.id, email: user.email, name: user.name },
  };
};

const update_role = async (id, role) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    httpError(404, "No user found");
  }

  const updated = await prisma.user.update({
    where: { id },
    role: role,
  });

  const token = await createToken(updated.id, updated.email, updated.role);
  return {
    token,
    role: updated.role,
    user: { id: updated.id, email: updated.email, name: updated.name },
  };
};

const signupUserWOVerify = async (email, password, role) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    httpError(409, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role },
  });

  return user;
};

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


module.exports = {
  signupUser,
  loginUser,
  verifyUser,
  update_role,
  verifyMicrosoftIdTokenAndSignIn,
  startGoogleOAuth,
  finishGoogleOAuth,
  signupUserWOVerify,
};
