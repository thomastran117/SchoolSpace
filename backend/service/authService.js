const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const bcrypt = require("bcrypt");
const prisma = require("../resource/prisma");
const { createToken } = require("./tokenService");
const microsoftOAuth = require("./oauth/microsoftService");

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = await createToken(user.id, user.email, user.role);
  return { token: token, role: user.role };
};

const signupUser = async (email, password, role) => {

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hash = await bcrypt.hash(password, 12);

 const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      role,
      provider: "local",
      providerId: null,
      name: "",
    },
  });

  return user;
};

const startMicrosoftOAuth = async () => {
  return microsoftOAuth.start();
};

const finishMicrosoftOAuth = async (callbackParams, expected) => {
  const profile = await microsoftOAuth.finish(callbackParams, expected);
  if (!profile.email) {
    const e = new Error("Microsoft account missing email"); e.statusCode = 400; throw e;
  }

  let user = await prisma.user.findUnique({ where: { email: profile.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        role: "user",
        provider: "microsoft",
        providerId: profile.sub,
        password: "",
      },
    });
  }

  const token = await createToken(user.id, user.email, user.role);
  return { token, role: user.role, user: { id: user.id, email: user.email, name: user.name } };
};

module.exports = {
  signupUser,
  loginUser,
  startMicrosoftOAuth,
  finishMicrosoftOAuth,
};