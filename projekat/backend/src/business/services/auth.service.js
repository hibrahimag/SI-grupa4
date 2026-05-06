'use strict';

const crypto = require('crypto');
const { User } = require('../../infrastructure/database/models');

const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

function buildVerificationUrl(token) {
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  return `${frontendBaseUrl}/auth/verify-email?token=${token}`;
}

function generateVerificationData() {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MS);
  return { token, expiresAt };
}

function logVerificationLink(email, token) {
  const verificationUrl = buildVerificationUrl(token);
  console.log(`[EMAIL VERIFICATION] ${email} -> ${verificationUrl}`);
}

async function register(payload) {
  const { ime, prezime, username, email, password, role, institution } = payload;

  const existingUserByEmail = await User.findOne({ where: { email } });
  if (existingUserByEmail) {
    const err = new Error('Korisnik sa ovim email-om već postoji.');
    err.status = 409;
    throw err;
  }

  const existingUserByUsername = await User.findOne({ where: { username } });
  if (existingUserByUsername) {
    const err = new Error('Korisnik sa ovim username-om već postoji.');
    err.status = 409;
    throw err;
  }

  const { token, expiresAt } = generateVerificationData();

  const user = await User.create({
    ime,
    prezime,
    username,
    email,
    passwordHash: password,
    role,
    status: 'PENDING',
    emailVerifikovan: false,
    emailVerificationToken: token,
    emailVerificationExpiresAt: expiresAt,
    institution: institution || null,
  });

  logVerificationLink(user.email, token);

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    status: user.status,
    emailVerifikovan: user.emailVerifikovan,
    message: 'Registracija uspješna. Provjerite email verifikacioni link (ispisan u backend konzoli).',
  };
}

async function verifyEmail(token) {
  const user = await User.findOne({ where: { emailVerificationToken: token } });

  if (!user) {
    const err = new Error('Verifikacioni token nije validan.');
    err.status = 400;
    throw err;
  }

  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
    const err = new Error('Verifikacioni token je istekao. Zatražite novi.');
    err.status = 400;
    throw err;
  }

  user.emailVerifikovan = true;
  user.status = 'ACTIVE';
  user.emailVerificationToken = null;
  user.emailVerificationExpiresAt = null;
  await user.save();

  return { message: 'Email uspješno verifikovan.' };
}

async function resendVerification(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  if (user.emailVerifikovan) {
    const err = new Error('Email je već verifikovan.');
    err.status = 400;
    throw err;
  }

  const { token, expiresAt } = generateVerificationData();
  user.emailVerificationToken = token;
  user.emailVerificationExpiresAt = expiresAt;
  await user.save();

  logVerificationLink(user.email, token);

  return { message: 'Novi verifikacioni link je generisan i ispisan u backend konzoli.' };
}

async function login(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user || user.passwordHash !== password) {
    const err = new Error('Pogrešan email ili lozinka.');
    err.status = 401;
    throw err;
  }

  if (!user.emailVerifikovan) {
    const err = new Error('Email nije verifikovan. Verifikujte email prije prijave.');
    err.status = 403;
    throw err;
  }

  return {
    message: 'Uspješna prijava.',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      emailVerifikovan: user.emailVerifikovan,
    },
  };
}

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
};
