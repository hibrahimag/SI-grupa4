// backend/src/business/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op, UniqueConstraintError } = require('sequelize');
const { User, Student, Koordinator, Kompanija, Fakultet } = require('../../infrastructure/database/models');
const sequelize = require('../../infrastructure/database/db');

const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';
const SALT_ROUNDS    = 10;
const EMAIL_RE       = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//za reset lozinke
const crypto = require('crypto');
const { sendPasswordResetEmail, sendEmailVerificationEmail } = require('./email.service');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
}

const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function createEmailVerificationTokenData() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS);
  return { rawToken, tokenHash, expiresAt };
}

async function setVerificationTokenForUser(user) {
  const { rawToken, tokenHash, expiresAt } = createEmailVerificationTokenData();
  user.emailVerificationToken = tokenHash;
  user.emailVerificationTokenExpiresAt = expiresAt;
  await user.save();
  return rawToken;
}

function getFrontendBaseUrl() {
  return process.env.FRONTEND_URL || process.env.FRONTEND_BASE_URL;
}

async function sendVerificationEmailForUser(user) {
  const token = await setVerificationTokenForUser(user);
  const frontendBaseUrl = getFrontendBaseUrl();

  if (!frontendBaseUrl) {
    const err = new Error('FRONTEND_URL environment variable is not set.');
    err.status = 500;
    throw err;
  }

  const verificationLink = `${frontendBaseUrl}/verify-email?token=${token}`;
  await sendEmailVerificationEmail(user.email, verificationLink);
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
        const user = await User.create(
          { ime, prezime, username, email, passwordHash, role: 'STUDENT', status: 'PENDING', institution: faculty.naziv },
          { transaction: t }
        );
        await Student.create(
          { userID: user.id, fakultetID: Number(fakultetID), year_of_study: year, index_number },
          { transaction: t }
        );
        return user;
      });
      await sendVerificationEmailForUser(user);
      return user;
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
        const user = await User.create(
          { ime, prezime, username, email, passwordHash, role: 'COORDINATOR', status: 'PENDING', institution: faculty.naziv },
          { transaction: t }
        );
        await Koordinator.create({ userID: user.id, fakultetID: Number(fakultetID) }, { transaction: t });
        return user;
      });
      await sendVerificationEmailForUser(user);
      return user;
    }

    if (role === 'COMPANY') {
      const { naziv, adresa, telefon, opisPoslovanja } = data;
      const user = await sequelize.transaction(async (t) => {
        const user = await User.create(
          { ime: naziv, prezime: '', username, email, passwordHash, role: 'COMPANY', status: 'PENDING', institution: naziv },
          { transaction: t }
        );
        await Kompanija.create(
          { userID: user.id, naziv, adresa: adresa || null, telefon: telefon || null, opisPoslovanja: opisPoslovanja || null },
          { transaction: t }
        );
        return user;
      });
      await sendVerificationEmailForUser(user);
      return user;
    }

    const err = new Error('Nepoznata rola.');
    err.status = 400;
    throw err;
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      const field = err.errors?.[0]?.path;
      const msg = field === 'email'
        ? 'Email adresa je već registrovana.'
        : 'Korisničko ime je već zauzeto.';
      const conflict = new Error(msg);
      conflict.status = 409;
      throw conflict;
    }
    throw err;
  }
}

/**
 * Validates credentials and returns a signed JWT + safe user payload.
 *
 * @param {string} identifier  – username or email (the user may type either)
 * @param {string} password    – plaintext password
 * @returns {{ token: string, user: object }}
 * @throws {Error} with a Bosnian user-facing message on any failure
 */
async function loginService(identifier, password) {
  // ── 1. Look up user by username OR email ──────────────────────────────────
  const user = await User.findOne({
    where: {
      // Sequelize Op.or to match either column
      [Op.or]: [
        { username: identifier },
        { email: identifier },
      ],
    },
  });




  // Deliberately vague: do not reveal whether the identifier exists
  if (!user) {
    throw new Error('Pogrešno korisničko ime/e-mail ili lozinka.');
  }

  // ── 2. Check account status before verifying password ────────────────────
  if (user.status === 'DEACTIVATED') {
    throw new Error('Vaš nalog je deaktiviran. Kontaktirajte administratora.');
  }

  if (!user.emailVerifikovan) {
    throw new Error('Niste verifikovali email adresu. Ne možete se prijaviti.');
  }

  if (user.status === 'PENDING') {
    throw new Error('Vaš nalog još nije aktivan. Sačekajte odobrenje administratora.');
  }

  if (user.role !== 'ADMIN') {
    if (user.approvalStatus === 'PENDING_APPROVAL') {
      throw new Error('Vaš korisnički račun čeka odobrenje administratora ili koordinatora.');
    }

    if (user.approvalStatus === 'REJECTED') {
      const reason = user.rejectionReason ? ` Razlog: ${user.rejectionReason}` : '';
      throw new Error(`Vaš zahtjev je odbijen.${reason}`);
    }

    if (user.approvalStatus !== 'APPROVED') {
      throw new Error('Vaš korisnički račun još nije odobren.');
    }
  }

  // ── 3. Verify password ────────────────────────────────────────────────────
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new Error('Pogrešno korisničko ime/e-mail ili lozinka.');
  }

  // ── 4. Sign JWT ───────────────────────────────────────────────────────────
  const payload = {
    id:   user.id,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // ── 5. Return token + safe user object (never expose passwordHash) ────────
  return {
    token,
    user: {
      id:          user.id,
      ime:         user.ime,
      prezime:     user.prezime,
      username:    user.username,
      email:       user.email,
      role:        user.role,
      institution: user.institution,
    },
  };
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
    where: {
      passwordResetToken: token,
    },
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

async function verifyEmailService(token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    where: {
      emailVerificationToken: tokenHash,
    },
  });

  if (!user) {
    const err = new Error('Neispravan verifikacioni token.');
    err.status = 400;
    throw err;
  }

  if (!user.emailVerificationTokenExpiresAt || user.emailVerificationTokenExpiresAt < new Date()) {
    const err = new Error('Verifikacioni token je istekao.');
    err.status = 400;
    throw err;
  }

  user.emailVerifikovan = true;
  user.approvalStatus = 'PENDING_APPROVAL';
  user.approvalRequestedAt = new Date();
  user.approvedAt = null;
  user.approvedBy = null;
  user.rejectedAt = null;
  user.rejectedBy = null;
  user.rejectionReason = null;
  user.emailVerificationToken = null;
  user.emailVerificationTokenExpiresAt = null;
  await user.save();
}

async function resendVerificationEmailService(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return;
  }

  if (user.emailVerifikovan) {
    const err = new Error('Email adresa je već verifikovana.');
    err.status = 400;
    throw err;
  }

  await sendVerificationEmailForUser(user);
}

module.exports = {
  checkAvailability,
  getPublicFaculties,
  register,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  verifyEmailService,
  resendVerificationEmailService,
};
