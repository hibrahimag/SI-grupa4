'use strict';

const { sequelize, User, Kompanija } = require('../../infrastructure/database/models');

const PROFILE_FIELDS = ['naziv', 'opisPoslovanja', 'djelatnost', 'adresa', 'telefon', 'kontaktOsoba'];
const OPTIONAL_FIELDS = ['opisPoslovanja', 'djelatnost', 'telefon', 'kontaktOsoba'];

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function hasOwn(data, field) {
  return Object.prototype.hasOwnProperty.call(data, field);
}

function normalizeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeRequired(value, message) {
  const normalized = normalizeString(value);
  if (!normalized) {
    throw makeError(message, 400);
  }
  return normalized;
}

function normalizeOptional(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function mapCompanyProfile(company) {
  return {
    naziv: company.naziv,
    opisPoslovanja: company.opisPoslovanja,
    djelatnost: company.djelatnost,
    adresa: company.adresa,
    telefon: company.telefon,
    kontaktOsoba: company.kontaktOsoba,
  };
}

async function findCompanyByUserId(userId) {
  const company = await Kompanija.findOne({ where: { userID: userId } });
  if (!company) {
    throw makeError('Profil kompanije nije pronađen.', 404);
  }
  return company;
}

async function getCompanyProfile(userId) {
  const company = await findCompanyByUserId(userId);
  return mapCompanyProfile(company);
}

async function updateCompanyProfile(userId, data) {
  const company = await findCompanyByUserId(userId);
  const nextNaziv = normalizeRequired(
    hasOwn(data, 'naziv') ? data.naziv : company.naziv,
    'Naziv kompanije je obavezan.'
  );
  const nextAdresa = normalizeRequired(
    hasOwn(data, 'adresa') ? data.adresa : company.adresa,
    'Adresa je obavezna.'
  );
  const nazivChanged = company.naziv !== nextNaziv;

  const updatedCompany = await sequelize.transaction(async (transaction) => {
    company.naziv = nextNaziv;
    company.adresa = nextAdresa;

    for (const field of OPTIONAL_FIELDS) {
      if (hasOwn(data, field)) {
        company[field] = normalizeOptional(data[field]);
      }
    }

    await company.save({ transaction, fields: PROFILE_FIELDS });

    if (nazivChanged) {
      const user = await User.findByPk(userId, { transaction });
      if (user) {
        user.ime = nextNaziv;
        user.institution = nextNaziv;
        await user.save({ transaction, fields: ['ime', 'institution'] });
      }
    }

    return company;
  });

  return mapCompanyProfile(updatedCompany);
}

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};
