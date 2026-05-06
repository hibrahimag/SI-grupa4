'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op, UniqueConstraintError } = require('sequelize');
const { User, Student, Koordinator, Kompanija, Fakultet } = require('../../infrastructure/database/models');
const sequelize = require('../../infrastructure/database/db');
const { sendPasswordResetEmail } = require('./email.service');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';
const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

function generateVerificationData() {
  return {
    token: crypto.randomBytes(32).toString('hex'),
    expiresAt: new Date(Date.now() + VERIFICATION_EXPIRY_MS),
  };
}

function buildVerificationUrl(token) {
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendBaseUrl}/verify-email?token=${token}`;
}

function logVerificationLink(email, token) {
  const verificationUrl = buildVerificationUrl(token);
  console.log(`[EMAIL VERIFICATION] ${email} -> ${verificationUrl}`);
}

async function checkAvailability(type, value) {
  if (!['username', 'email'].includes(type) || !value) {
    const err = new Error('Neispravni parametri.');
    err.status = 400;
    throw err;
  }
  const where = type === 'username' ? { username: value } : { email: value };
  const existing = await User.findOne({ where });
  return { available: !existing };
}

async function getPublicFaculties() {
  return Fakultet.findAll({ attributes: ['id', 'naziv'], order: [['naziv', 'ASC']] });
}

async function register(data) {
  const { role, username, email, password } = data;

  if (!EMAIL_RE.test(email)) {
    const err = new Error('Email adresa nije ispravnog formata.');
    err.status = 400;
    throw err;
  }

  if (!password || password.length < 8) {
    const err = new Error('Lozinka mora imati najmanje 8 karaktera.');
    err.status = 400;
    throw err;
  }

  const takenUsername = await User.findOne({ where: { username } });
  if (takenUsername) {
    const err = new Error('Korisničko ime je već zauzeto.');
    err.status = 409;
    throw err;
  }

  const takenEmail = await User.findOne({ where: { email } });
  if (takenEmail) {
    const err = new Error('Email adresa je već registrovana.');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const { token, expiresAt } = generateVerificationData();

  try {
    if (role === 'STUDENT') {
      const { ime, prezime, fakultetID, year_of_study, index_number } = data;
      const year = Number(year_of_study);
      if (!Number.isInteger(year) || year < 1) {
        const err = new Error('Godina studija mora biti pozitivan cijeli broj.');
        err.status = 400;
        throw err;
      }
      const faculty = await Fakultet.findByPk(fakultetID);
      if (!faculty) {
        const err = new Error('Odabrani fakultet nije pronađen.');
        err.status = 404;
        throw err;
      }
      const user = await sequelize.transaction(async (t) => {
        const createdUser = await User.create(
          {
            ime,
            prezime,
            username,
            email,
            passwordHash,
            role: 'STUDENT',
            status: 'PENDING',
            emailVerifikovan: false,
            emailVerificationToken: token,
            emailVerificationExpiresAt: expiresAt,
            institution: faculty.naziv,
          },
          { transaction: t }
        );
        await Student.create(
          { userID: createdUser.id, fakultetID: Number(fakultetID), year_of_study: year, index_number },
          { transaction: t }
        );
        return createdUser;
      });
      logVerificationLink(user.email, token);
      return { id: user.id, email: user.email, role: user.role };
    }

    if (role === 'COORDINATOR') {
      const { ime, prezime, fakultetID } = data;
      const faculty = await Fakultet.findByPk(fakultetID);
      if (!faculty) {
        const err = new Error('Odabrani fakultet nije pronađen.');
        err.status = 404;
        throw err;
      }
      const user = await sequelize.transaction(async (t) => {
        const createdUser = await User.create(
          {
            ime,
            prezime,
            username,
            email,
            passwordHash,
            role: 'COORDINATOR',
            status: 'PENDING',
            emailVerifikovan: false,
            emailVerificationToken: token,
            emailVerificationExpiresAt: expiresAt,
            institution: faculty.naziv,
          },
          { transaction: t }
        );
        await Koordinator.create({ userID: createdUser.id, fakultetID: Number(fakultetID) }, { transaction: t });
        return createdUser;
      });
      logVerificationLink(user.email, token);
      return { id: user.id, email: user.email, role: user.role };
    }

    if (role === 'COMPANY') {
      const { naziv, adresa, telefon, opisPoslovanja } = data;
      const user = await sequelize.transaction(async (t) => {
        const createdUser = await User.create(
          {
            ime: naziv,
            prezime: '',
            username,
            email,
            passwordHash,
            role: 'COMPANY',
            status: 'PENDING',
            emailVerifikovan: false,
            emailVerificationToken: token,
            emailVerificationExpiresAt: expiresAt,
            institution: naziv,
          },
          { transaction: t }
        );
        await Kompanija.create(
          { userID: createdUser.id, naziv, adresa: adresa || null, telefon: telefon || null, opisPoslovanja: opisPoslovanja || null },
          { transaction: t }
        );
        return createdUser;
      });
      logVerificationLink(user.email, token);
      return { id: user.id, email: user.email, role: user.role };
    }

    const err = new Error('Nepoznata rola.');
    err.status = 400;
    throw err;
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      const field = err.errors?.[0]?.path;
      const msg = field === 'email' ? 'Email adresa je već registrovana.' : 'Korisničko ime je već zauzeto.';
      const conflict = new Error(msg);
      conflict.status = 409;
      throw conflict;
    }
    throw err;
  }
}

async function loginService(identifier, password) {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    throw new Error('Pogrešno korisničko ime/e-mail ili lozinka.');
  }

  if (!user.emailVerifikovan) {
    throw new Error('Email nije verifikovan. Verifikujte email prije prijave.');
  }

  if (user.status === 'DEACTIVATED') {
    throw new Error('Vaš nalog je deaktiviran. Kontaktirajte administratora.');
  }

  if (user.status === 'PENDING') {
    throw new Error('Vaš nalog još nije aktivan. Sačekajte odobrenje administratora.');
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error('Pogrešno korisničko ime/e-mail ili lozinka.');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return {
    token,
    user: {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      email: user.email,
      role: user.role,
      institution: user.institution,
      status: user.status,
      emailVerifikovan: user.emailVerifikovan,
    },
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

async function forgotPasswordService(email) {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user.email, resetLink);
}

async function resetPasswordService(token, newPassword) {
  const user = await User.findOne({
    where: { passwordResetToken: token },
  });

  if (!user) {
    throw new Error('Neispravan token.');
  }

  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new Error('Token je istekao.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordHash = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
}

module.exports = {
  checkAvailability,
  getPublicFaculties,
  register,
  loginService,
  verifyEmail,
  resendVerification,
  forgotPasswordService,
  resetPasswordService,
};
