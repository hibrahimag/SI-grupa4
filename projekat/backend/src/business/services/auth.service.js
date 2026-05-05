'use strict';

const bcrypt = require('bcrypt');
const { UniqueConstraintError } = require('sequelize');
const sequelize = require('../../infrastructure/database/db');
const { User, Student, Koordinator, Kompanija, Fakultet } = require('../../infrastructure/database/models');

const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      return await sequelize.transaction(async (t) => {
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
    }

    if (role === 'COORDINATOR') {
      const { ime, prezime, fakultetID } = data;
      const faculty = await Fakultet.findByPk(fakultetID);
      if (!faculty) {
        const err = new Error('Odabrani fakultet nije pronađen.');
        err.status = 404;
        throw err;
      }
      return await sequelize.transaction(async (t) => {
        const user = await User.create(
          { ime, prezime, username, email, passwordHash, role: 'COORDINATOR', status: 'PENDING', institution: faculty.naziv },
          { transaction: t }
        );
        await Koordinator.create({ userID: user.id, fakultetID: Number(fakultetID) }, { transaction: t });
        return user;
      });
    }

    if (role === 'COMPANY') {
      const { naziv, adresa, telefon, opisPoslovanja } = data;
      return await sequelize.transaction(async (t) => {
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

module.exports = { checkAvailability, getPublicFaculties, register };
