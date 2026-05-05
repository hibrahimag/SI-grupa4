// backend/src/business/services/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../../infrastructure/database/models');

const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set.');
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

  if (user.status === 'PENDING') {
    throw new Error('Vaš nalog još nije aktivan. Sačekajte odobrenje administratora.');
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

module.exports = { loginService };