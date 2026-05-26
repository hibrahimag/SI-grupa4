'use strict';

const {
  User,
  Student,
  Kompanija,
  Fakultet,
  Odsjek,
  Oglas,
  PrijavaNaPraksu,
  Praksa,
} = require('../../infrastructure/database/models');
const { resolveCoordinatorProfile } = require('./coordinatorProfile.service');
const {
  APPLICATION_STATUS,
  COORDINATOR_STATUS,
  COMPANY_STATUS,
  STUDENT_STATUS,
} = require('./applicationStatus.service');

const PRACTICE_LIFECYCLE = {
  UPCOMING: 'NADOLAZECA',
  ACTIVE: 'AKTIVNA',
  FINISHED: 'ZAVRSENA',
  WITHDRAWN: 'ODUSTAO',
};

const FILTER_LIFECYCLE = {
  all: null,
  upcoming: PRACTICE_LIFECYCLE.UPCOMING,
  active: PRACTICE_LIFECYCLE.ACTIVE,
  finished: PRACTICE_LIFECYCLE.FINISHED,
  nadolazeca: PRACTICE_LIFECYCLE.UPCOMING,
  aktivna: PRACTICE_LIFECYCLE.ACTIVE,
  zavrsena: PRACTICE_LIFECYCLE.FINISHED,
};

function makeError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function formatUtcDate(year, month, day) {
  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

function dateOnly(value) {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return formatUtcDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }

  const normalized = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() !== Number(match[2]) - 1 ||
    date.getUTCDate() !== Number(match[3])
  ) {
    return null;
  }
  return normalized;
}

function toUtcDate(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function calculatePracticeDates(datumPocetka, trajanje) {
  if (!datumPocetka) {
    throw makeError('Datum početka prakse je obavezan.');
  }
  if (trajanje === null || trajanje === undefined || String(trajanje).trim() === '') {
    throw makeError('Trajanje prakse je obavezno.');
  }

  const start = dateOnly(datumPocetka);
  const months = Number(String(trajanje).trim());
  if (!start || !Number.isInteger(months) || months <= 0) {
    throw makeError('Nije moguće odrediti datum završetka prakse iz unesenog trajanja.');
  }

  const [startYear, startMonth, startDay] = start.split('-').map(Number);
  const targetFirst = new Date(Date.UTC(startYear, startMonth - 1 + months, 1));
  const targetYear = targetFirst.getUTCFullYear();
  const targetMonth = targetFirst.getUTCMonth() + 1;
  const targetLastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();

  let end;
  if (startDay > targetLastDay) {
    end = formatUtcDate(targetYear, targetMonth, targetLastDay);
  } else {
    const nextPeriodDate = new Date(Date.UTC(targetYear, targetMonth - 1, startDay));
    nextPeriodDate.setUTCDate(nextPeriodDate.getUTCDate() - 1);
    end = formatUtcDate(
      nextPeriodDate.getUTCFullYear(),
      nextPeriodDate.getUTCMonth() + 1,
      nextPeriodDate.getUTCDate()
    );
  }

  return {
    datumPocetka: start,
    datumKraja: end,
    datumPocetkaDate: toUtcDate(start),
    datumKrajaDate: toUtcDate(end),
  };
}

function todayDateOnly(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Sarajevo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const dateParts = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value])
  );
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function practiceLifecycleStatus(praksa, today = todayDateOnly()) {
  if (praksa.datumOdustajanja) return PRACTICE_LIFECYCLE.WITHDRAWN;

  const start = dateOnly(praksa.datumPocetka);
  const end = dateOnly(praksa.datumKraja);
  if (!start || !end) return null;
  if (start > today) return PRACTICE_LIFECYCLE.UPCOMING;
  if (end < today) return PRACTICE_LIFECYCLE.FINISHED;
  return PRACTICE_LIFECYCLE.ACTIVE;
}

function normalizePracticeFilter(filter = 'all') {
  const normalized = String(filter || 'all').toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(FILTER_LIFECYCLE, normalized)) {
    throw makeError('Neispravan filter praksi.');
  }
  return FILTER_LIFECYCLE[normalized];
}

async function ensurePracticeForApplication(prijava, oglas, { transaction } = {}) {
  let praksa = await Praksa.findOne({
    where: { prijavaID: prijava.id },
    transaction,
  });

  if (!praksa) {
    const period = calculatePracticeDates(oglas.datumPocetka, oglas.trajanje);
    praksa = await Praksa.create(
      {
        prijavaID: prijava.id,
        datumPocetka: period.datumPocetkaDate,
        datumKraja: period.datumKrajaDate,
        razlogOdustajanja: null,
        datumOdustajanja: null,
      },
      { transaction }
    );
  }

  return praksa;
}

function approvedAcceptedWhere() {
  return {
    status: APPLICATION_STATUS.APPROVED,
    koordinatorStatus: COORDINATOR_STATUS.APPROVED,
    kompanijaStatus: COMPANY_STATUS.APPROVED,
    studentStatus: STUDENT_STATUS.ACCEPTED,
  };
}

function mapPractice(praksa) {
  const prijava = praksa.PrijavaNaPraksu;
  const student = prijava?.Student;
  const studentUser = student?.User;
  const oglas = prijava?.Oglas || prijava?.Ogla;
  const kompanija = oglas?.Kompanija;

  return {
    id: praksa.id,
    prijavaID: praksa.prijavaID,
    lifecycleStatus: practiceLifecycleStatus(praksa),
    datumPocetka: dateOnly(praksa.datumPocetka),
    datumKraja: dateOnly(praksa.datumKraja),
    datumOdustajanja: dateOnly(praksa.datumOdustajanja),
    status: prijava?.status || null,
    koordinatorStatus: prijava?.koordinatorStatus || null,
    kompanijaStatus: prijava?.kompanijaStatus || null,
    studentStatus: prijava?.studentStatus || null,
    oglas: oglas ? { id: oglas.id, naziv: oglas.naziv } : null,
    kompanija: kompanija ? { id: kompanija.id, naziv: kompanija.naziv } : null,
    student: student
      ? {
          id: student.id,
          ime: studentUser?.ime || null,
          prezime: studentUser?.prezime || null,
          index_number: student.index_number,
          odsjek: student.Odsjek?.naziv || null,
          fakultet: student.Fakultet?.naziv || null,
        }
      : null,
  };
}

async function loadPractices({ practiceWhere = {}, studentWhere = {}, oglasWhere = {}, filter = 'all' }) {
  const lifecycleFilter = normalizePracticeFilter(filter);
  const rows = await Praksa.findAll({
    where: practiceWhere,
    include: [{
      model: PrijavaNaPraksu,
      required: true,
      where: approvedAcceptedWhere(),
      attributes: ['id', 'status', 'koordinatorStatus', 'kompanijaStatus', 'studentStatus'],
      include: [
        {
          model: Student,
          required: true,
          where: studentWhere,
          attributes: ['id', 'index_number', 'fakultetID', 'odsjekID'],
          include: [
            { model: User, attributes: ['ime', 'prezime'] },
            { model: Fakultet, attributes: ['id', 'naziv'], required: false },
            { model: Odsjek, attributes: ['id', 'naziv'], required: false },
          ],
        },
        {
          model: Oglas,
          required: true,
          where: oglasWhere,
          attributes: ['id', 'naziv', 'kompanijaID'],
          include: [{ model: Kompanija, attributes: ['id', 'naziv'] }],
        },
      ],
    }],
    order: [['datumPocetka', 'DESC']],
  });

  const mapped = rows.map(mapPractice);
  return lifecycleFilter
    ? mapped.filter((praksa) => praksa.lifecycleStatus === lifecycleFilter)
    : mapped;
}

async function resolveStudent(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'STUDENT') {
    throw makeError('Nemate dozvolu za pristup ovom resursu.', 403);
  }
  const student = await Student.findOne({ where: { userID: user.id } });
  if (!student) throw makeError('Studentski profil nije pronađen.', 404);
  return student;
}

async function resolveCompany(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'COMPANY') {
    throw makeError('Nemate dozvolu za pristup ovom resursu.', 403);
  }
  const kompanija = await Kompanija.findOne({ where: { userID: user.id } });
  if (!kompanija) throw makeError('Profil kompanije nije pronađen.', 404);
  return kompanija;
}

async function getStudentPractices(userId, filter = 'all') {
  const student = await resolveStudent(userId);
  const prakse = await loadPractices({ studentWhere: { id: student.id }, filter });
  return { prakse };
}

async function getStudentPracticeById(userId, practiceId) {
  const student = await resolveStudent(userId);
  const prakse = await loadPractices({
    practiceWhere: { id: practiceId },
    studentWhere: { id: student.id },
    filter: 'all',
  });
  return prakse[0] || null;
}

async function getCompanyPractices(userId, filter = 'all') {
  const kompanija = await resolveCompany(userId);
  const prakse = await loadPractices({ oglasWhere: { kompanijaID: kompanija.id }, filter });
  return { prakse };
}

async function getCoordinatorPractices(userId, filter = 'all') {
  const koordinator = await resolveCoordinatorProfile(userId);
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');
  const prakse = await loadPractices({ studentWhere: { fakultetID: koordinator.fakultetID }, filter });
  return { prakse };
}

async function getCoordinatorPracticeSummary(userId) {
  const { prakse } = await getCoordinatorPractices(userId, 'all');
  return {
    aktivnePrakse: prakse.filter((praksa) => praksa.lifecycleStatus === PRACTICE_LIFECYCLE.ACTIVE).length,
    zavrsene: prakse.filter((praksa) => praksa.lifecycleStatus === PRACTICE_LIFECYCLE.FINISHED).length,
  };
}

async function backfillAcceptedPractices() {
  const acceptedApplications = await PrijavaNaPraksu.findAll({
    where: approvedAcceptedWhere(),
    include: [
      { model: Oglas, attributes: ['id', 'datumPocetka', 'trajanje'] },
      { model: Praksa, required: false, attributes: ['id', 'prijavaID'] },
    ],
  });

  for (const prijava of acceptedApplications) {
    if (prijava.Praksa) continue;
    try {
      await ensurePracticeForApplication(prijava, prijava.Oglas || prijava.Ogla);
    } catch (error) {
      console.warn(`[prakse] Preskočen backfill prijave ${prijava.id}: ${error.message}`);
    }
  }
}

module.exports = {
  PRACTICE_LIFECYCLE,
  calculatePracticeDates,
  practiceLifecycleStatus,
  ensurePracticeForApplication,
  getStudentPractices,
  getStudentPracticeById,
  getCompanyPractices,
  getCoordinatorPractices,
  getCoordinatorPracticeSummary,
  backfillAcceptedPractices,
};
