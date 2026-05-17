'use strict';

const {
  User,
  Student,
  Oglas,
  PrijavaNaPraksu,
  Kompanija,
} = require('../../infrastructure/database/models');

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

async function createApplication(userId, data = {}) {
  const oglasID = Number(data.oglasID);
  if (!Number.isInteger(oglasID) || oglasID <= 0) {
    throw makeError('Oglas nije pronađen.', 404);
  }

  const { student } = await resolveStudentFromUser(userId);

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

  return PrijavaNaPraksu.create({
    studentID: student.id,
    oglasID: oglas.id,
    status: 'PODNESENA',
  });
}

async function getMyApplications(userId) {
  const { student } = await resolveStudentFromUser(userId);

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
