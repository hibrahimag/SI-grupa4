'use strict';

const {
  User,
  Student,
  Oglas,
  PrijavaNaPraksu,
  Kompanija,
  Dokument,
  Odsjek,
  Fakultet,
} = require('../../infrastructure/database/models');
const { createNotification } = require('./notifications.service');
const { sendPrijavaPodnesenaEmail } = require('./email.service');
const {
  getOrCreatePreferences,
  canSendInApp,
  canSendEmail,
} = require('./notificationPreferences.service');

const { checkStudentApplicationLimit } = require('./application_limit.service');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

function isStudentProfileComplete(user, student) {
  return (
    hasValue(user.ime) &&
    hasValue(user.prezime) &&
    hasValue(user.email) &&
    hasValue(student.index_number) &&
    Number.isInteger(Number(student.year_of_study)) &&
    Number(student.year_of_study) > 0 &&
    hasValue(student.fakultetID)
  );
}

async function resolveStudentFromUser(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'STUDENT') {
    throw makeError('Nemate dozvolu za pristup ovom resursu.', 403);
  }

  const student = await Student.findOne({ where: { userID: user.id } });
  if (!student) {
    throw makeError('Profil studenta nije potpun. Popunite profil prije prijave.', 400);
  }

  if (!isStudentProfileComplete(user, student)) {
    throw makeError('Profil studenta nije potpun. Popunite profil prije prijave.', 400);
  }

  return { user, student };
}

async function resolveStudentForListing(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'STUDENT') {
    throw makeError('Nemate dozvolu za pristup ovom resursu.', 403);
  }

  const student = await Student.findOne({ where: { userID: user.id } });
  if (!student || !isStudentProfileComplete(user, student)) {
    return null;
  }

  return student;
}

async function createApplication(userId, data = {}) {
  
// na početku createApplication funkcije:
  const limitCheck = await checkStudentApplicationLimit(userId);
  if (!limitCheck.allowed) {
    const err = new Error(
      `Dostigli ste maksimalan broj aktivnih prijava (${limitCheck.current}/${limitCheck.limit}). ` +
      `Pričekajte da neka prijava bude riješena.`
    );
    err.status = 403;
    throw err;
  }

  const oglasID = Number(data.oglasID);
  if (!Number.isInteger(oglasID) || oglasID <= 0) {
    throw makeError('Oglas nije pronađen.', 404);
  }

  const { student, user } = await resolveStudentFromUser(userId);

  const oglas = await Oglas.findByPk(oglasID);
  if (!oglas) {
    throw makeError('Oglas nije pronađen.', 404);
  }

  if (oglas.status !== 'AKTIVAN') {
    throw makeError('Nije moguće prijaviti se na neaktivan oglas.', 400);
  }

  const existingApplication = await PrijavaNaPraksu.findOne({
    where: {
      studentID: student.id,
      oglasID: oglas.id,
    },
  });

  if (existingApplication) {
    throw makeError('Već ste se prijavili na ovaj oglas.', 409);
  }

  const prijava = await PrijavaNaPraksu.create({
    studentID: student.id,
    oglasID: oglas.id,
    status: 'PODNESENA',
  });

  await Dokument.update(
    { prijava_id: prijava.id },
    { where: { student_id: student.id, oglas_id: oglas.id, prijava_id: null } }
  );

  const prijavaDocs = await Dokument.findAll({
    where: { student_id: student.id, prijava_id: prijava.id },
  });

  const cv = prijavaDocs.find(d => d.tip_dokumenta === 'CV');
  const motivaciono = prijavaDocs.find(d => d.tip_dokumenta === 'MOTIVACIONO_PISMO');

  await prijava.update({
    cv: cv ? cv.file_path : null,
    motivacionoPismo: motivaciono ? motivaciono.file_path : null,
  });

  const kompanija = await Kompanija.findByPk(oglas.kompanijaID);
  const kompanijaNaziv = kompanija?.naziv || 'Kompanija';

  const tip = 'PRIJAVA_PODNESENA';
const preferences = await getOrCreatePreferences(userId);

if (canSendInApp(preferences, tip)) {
  createNotification(
    student.id,
    prijava.id,
    tip,
    'Prijava podnesena',
    `Vaša prijava na praksu "${oglas.naziv}" kod kompanije ${kompanijaNaziv} je uspješno podnesena.`
  ).catch(() => {});
}

if (canSendEmail(preferences, tip)) {
  sendPrijavaPodnesenaEmail(user.email, oglas.naziv, kompanijaNaziv).catch(() => {});
}

  return prijava;
}

async function getMyApplications(userId) {
  const student = await resolveStudentForListing(userId);
  if (!student) return [];

  return PrijavaNaPraksu.findAll({
    where: { studentID: student.id },
    include: [
      {
        model: Oglas,
        attributes: ['id', 'naziv', 'status', 'kompanijaID'],
        include: [{ model: Kompanija, attributes: ['id', 'naziv'] }],
      },
    ],
    order: [['datumPrijave', 'DESC']],
  });
}

async function getApplicationStatistics(userId, { fakultetID, odsjekID, godina, status, oglasID } = {}) {
  const kompanija = await Kompanija.findOne({ where: { userID: userId } });
  if (!kompanija) {
    throw makeError('Kompanija nije pronađena.', 404);
  }

  const oglasi = await Oglas.findAll({
    where: { kompanijaID: kompanija.id },
    attributes: ['id', 'naziv', 'status'],
  });

  const oglasiList = oglasi.map((o) => ({ id: o.id, naziv: o.naziv }));

  if (oglasi.length === 0) {
    return {
      summary: { totalApplications: 0, listingsWithApplications: 0 },
      perListing: [],
      byYear: [],
      byOdsjek: [],
      byFakultet: [],
      oglasi: [],
    };
  }

  const oglasIDs = oglasi.map((o) => o.id);
  const oglasInfoMap = {};
  for (const o of oglasi) {
    oglasInfoMap[o.id] = { oglasID: o.id, naziv: o.naziv, oglasStatus: o.status, count: 0 };
  }

  const studentWhere = {};
  if (fakultetID) studentWhere.fakultetID = Number(fakultetID);
  if (odsjekID) studentWhere.odsjekID = Number(odsjekID);
  if (godina) studentWhere.year_of_study = Number(godina);

  const hasStudentFilter = Object.keys(studentWhere).length > 0;

  const oglasIDNum = oglasID ? Number(oglasID) : null;
  const prijaveWhere = {
    oglasID: oglasIDNum && oglasIDs.includes(oglasIDNum) ? oglasIDNum : oglasIDs,
  };
  if (status) prijaveWhere.status = status;

  const prijave = await PrijavaNaPraksu.findAll({
    where: prijaveWhere,
    attributes: ['id', 'oglasID'],
    include: [
      {
        model: Student,
        attributes: ['id', 'year_of_study', 'odsjekID', 'fakultetID'],
        where: hasStudentFilter ? studentWhere : undefined,
        required: hasStudentFilter,
        include: [
          { model: Odsjek, attributes: ['id', 'naziv'] },
          { model: Fakultet, attributes: ['id', 'naziv'] },
        ],
      },
    ],
  });

  const yearMap = {};
  const odsjekMap = {};
  const fakultetMap = {};

  for (const prijava of prijave) {
    const student = prijava.Student;
    oglasInfoMap[prijava.oglasID].count++;

    if (student?.year_of_study) {
      const y = student.year_of_study;
      yearMap[y] = (yearMap[y] || 0) + 1;
    }

    if (student?.Odsjek && student?.Fakultet) {
      const o = student.Odsjek;
      const f = student.Fakultet;
      if (!odsjekMap[f.id]) {
        odsjekMap[f.id] = { fakultetID: f.id, fakultetNaziv: f.naziv, odsjeci: {} };
      }
      if (!odsjekMap[f.id].odsjeci[o.id]) {
        odsjekMap[f.id].odsjeci[o.id] = { odsjekID: o.id, naziv: o.naziv, count: 0 };
      }
      odsjekMap[f.id].odsjeci[o.id].count++;
    }

    if (student?.Fakultet) {
      const f = student.Fakultet;
      if (!fakultetMap[f.id]) {
        fakultetMap[f.id] = { fakultetID: f.id, naziv: f.naziv, count: 0 };
      }
      fakultetMap[f.id].count++;
    }
  }

  const perListing = Object.values(oglasInfoMap)
    .filter((l) => l.count > 0)
    .sort((a, b) => b.count - a.count);

  const byYear = Object.entries(yearMap)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);

  const byOdsjek = Object.values(odsjekMap)
    .map((f) => ({
      fakultetID: f.fakultetID,
      fakultetNaziv: f.fakultetNaziv,
      odsjeci: Object.values(f.odsjeci).sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => {
      const totalA = a.odsjeci.reduce((s, o) => s + o.count, 0);
      const totalB = b.odsjeci.reduce((s, o) => s + o.count, 0);
      return totalB - totalA;
    });

  const byFakultet = Object.values(fakultetMap).sort((a, b) => b.count - a.count);

  return {
    summary: {
      totalApplications: prijave.length,
      listingsWithApplications: perListing.length,
    },
    perListing,
    byYear,
    byOdsjek,
    byFakultet,
    oglasi: oglasiList,
  };
}

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationStatistics,
};
