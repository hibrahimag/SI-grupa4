'use strict';

const {
  User,
  Student,
  Oglas,
  PrijavaNaPraksu,
  Kompanija,
  Dokument,
} = require('../../infrastructure/database/models');
const { createNotification } = require('./notifications.service');
const { sendPrijavaPodnesenaEmail } = require('./email.service');
const {
  getOrCreatePreferences,
  canSendInApp,
  canSendEmail,
} = require('./notificationPreferences.service');

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

module.exports = {
  createApplication,
  getMyApplications,
};
