'use strict';

const { Kompanija } = require('../../infrastructure/database/models');

const COMPANY_PROFILE_FIELDS = [
  'naziv',
  'opisPoslovanja',
  'adresa',
  'telefon',
  'kontaktOsoba',
];

async function getCompanyProfile(userId) {
  const company = await Kompanija.findOne({
    where: { userID: userId },
  });

  if (!company) {
    const err = new Error('Kompanijski profil nije pronadjen.');
    err.status = 404;
    throw err;
  }

  return company;
}

async function updateCompanyProfile(userId, data) {
  const company = await getCompanyProfile(userId);
  const updates = {};

  for (const field of COMPANY_PROFILE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      updates[field] = data[field];
    }
  }

  await company.update(updates);
  return company;
}

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};
