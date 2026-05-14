'use strict';

const { Oglas, Kompanija, User } = require('../../infrastructure/database/models');

async function createListing(data, userId) {

  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  // Mora biti kompanija
  if (user.role !== 'COMPANY') {
    const err = new Error('Samo kompanija može kreirati oglas.');
    err.status = 403;
    throw err;
  }

  // Mora biti email verifikovan
  if (!user.emailVerifikovan) {
    const err = new Error('Morate verifikovati email.');
    err.status = 403;
    throw err;
  }

  // Mora biti odobren
  if (user.approvalStatus !== 'APPROVED' || user.status !== 'ACTIVE') {
    const err = new Error('Vaš korisnički račun još nije odobren.');
    err.status = 403;
    throw err;
  }

  // Pronađi kompanijski profil
  const kompanija = await Kompanija.findOne({
    where: { userID: user.id },
  });

  if (!kompanija) {
    const err = new Error('Kompanijski profil nije pronađen.');
    err.status = 404;
    throw err;
  }

  const oglas = await Oglas.create({
    naziv: data.naziv,
    opis: data.opis,
    brojMjesta: data.brojMjesta,
    rokPrijave: data.rokPrijave,
    trajanje: data.trajanje ? String(data.trajanje) : null,
    oblast: data.oblast || null,
    placenaPraksa: data.placenaPraksa || false,
    lokacija: data.lokacija?.trim() || null,
    tip: data.tip || 'Onsite',
    datumPocetka: data.datumPocetka || null,
    tehnologije: Array.isArray(data.tehnologije) ? data.tehnologije.filter(Boolean) : [],
    uslovi: Array.isArray(data.uslovi) ? data.uslovi.filter(Boolean) : [],
    status: 'AKTIVAN',
    kompanijaID: kompanija.id,
  });

  return oglas;
}

async function getListingsByCompany(userId) {
  const kompanija = await Kompanija.findOne({
    where: { userID: userId },
  });

  if (!kompanija) {
    const err = new Error('Kompanijski profil nije pronadjen.');
    err.status = 404;
    throw err;
  }

  return Oglas.findAll({
    where: { kompanijaID: kompanija.id },
    order: [['datumObjave', 'DESC']],
  });
}

async function getActiveListings() {
  return Oglas.findAll({
    where: { status: 'AKTIVAN' },
    include: [{
      model: Kompanija,
      attributes: ['id', 'naziv', 'kontaktOsoba'],
      include: [{ model: User, attributes: ['email'] }],
    }],
    order: [['datumObjave', 'DESC']],
  });
}

module.exports = {
  createListing,
  getListingsByCompany,
  getActiveListings,
};
