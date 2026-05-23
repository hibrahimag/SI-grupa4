'use strict';

const db = require('../../infrastructure/database/models');

// ─── getDashboardStats ────────────────────────────────────────────────────────
const getDashboardStats = async () => {
  const [ukupno, podnesene, odobrene, odbijene] = await Promise.all([
    db.PrijavaNaPraksu.count(),
    db.PrijavaNaPraksu.count({ where: { status: 'PODNESENA' } }),
    db.PrijavaNaPraksu.count({ where: { status: 'ODOBRENA'  } }),
    db.PrijavaNaPraksu.count({ where: { status: 'ODBIJENA'  } }),
  ]);

  let aktivnePrakse = 0, zavrsene = 0;
  if (db.Praksa) {
    [aktivnePrakse, zavrsene] = await Promise.all([
      db.Praksa.count().catch(() => 0),
      Promise.resolve(0), // nema status kolone još
    ]);
  }
  return { ukupno, podnesene, odobrene, odbijene, aktivnePrakse, zavrsene };
};

// ─── getPrijave ───────────────────────────────────────────────────────────────
const getPrijave = async ({ status, stranica = 1, limit = 15, koordinatorUserId }) => {
  const offset = (parseInt(stranica) - 1) * parseInt(limit);
  const where  = {};
  if (status) where.status = status;

  const koordinator = await db.Koordinator.findOne({
    where: { userID: koordinatorUserId },
    attributes: ['fakultetID'],
  });
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  const { count, rows } = await db.PrijavaNaPraksu.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    include: [
      {
        model: db.Student,
        where: { fakultetID: koordinator.fakultetID },
        include: [{ model: db.User, attributes: ['ime', 'prezime', 'email'] }],
        attributes: ['id', 'index_number', 'year_of_study', 'odsjekID', 'fakultetID'],
      },
      {
        model: db.Oglas,
        include: [{
          model: db.Kompanija,
          include: [{ model: db.User, attributes: ['ime', 'email'] }],
          attributes: ['id', 'naziv'],
        }],
        attributes: ['id', 'naziv', 'trajanje', 'brojMjesta'],
      },
    ],
    order: [['datumPrijave', 'DESC']],
  });
  
  return {
    prijave: rows,
    ukupno: count,
    stranice: Math.ceil(count / parseInt(limit)),
    trenutnaStranica: parseInt(stranica),
  };
};

// ─── getPrijavaById ───────────────────────────────────────────────────────────
const getPrijavaById = async (id, koordinatorUserId) => {
  const koordinator = await db.Koordinator.findOne({
    where: { userID: koordinatorUserId },
    attributes: ['fakultetID'],
  });
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');
  const prijava = await db.PrijavaNaPraksu.findByPk(id, {
    include: [
      {
        model: db.Student,
        include: [{ model: db.User, attributes: ['ime', 'prezime', 'email'] }],
        attributes: ['id', 'index_number', 'year_of_study', 'odsjekID', 'fakultetID'],
      },
      {
        model: db.Oglas,
        include: [{
          model: db.Kompanija,
          include: [{ model: db.User, attributes: ['ime', 'email'] }],
          attributes: ['id', 'naziv', 'adresa'],
        }],
      },
      {
      model: db.Dokument,
      attributes: ['id', 'original_name', 'tip_dokumenta', 'mime_path', 'created_at'],
      required: false,
    },
    ],
  });
  if (!prijava) throw new Error('NOT_FOUND');
  if (prijava.Student?.fakultetID !== koordinator.fakultetID) {
    throw new Error('NOT_FOUND');
  }
  return prijava;
};

// ─── odluciOPrijavi ───────────────────────────────────────────────────────────
const odluciOPrijavi = async (id, odluka, razlog, koordinatorUserId) => {
  const prijava = await db.PrijavaNaPraksu.findByPk(id);
  if (!prijava) throw new Error('NOT_FOUND');

  if (!['PODNESENA', 'U_RAZMATRANJU'].includes(prijava.status)) {
    throw new Error('INVALID_STATUS');
  }

  const noviStatus = odluka === 'odobrena' ? 'ODOBRENA' : 'ODBIJENA';
  await prijava.update({
    status: noviStatus,
    razlogOdbijanja: odluka === 'odbijena' ? razlog : null,
    koordinatorID: koordinatorUserId,
  });

  return { id: prijava.id, status: noviStatus };
};

// ─── getStudenti ──────────────────────────────────────────────────────────────
// Returns only STUDENT role users from the same faculty as the coordinator
const getStudenti = async (koordinatorUserId, pretraga = '') => {
  const { Op } = require('sequelize');

  // 1. Get coordinator's fakultetID
  const koordinator = await db.Koordinator.findOne({
    where: { userID: koordinatorUserId },
    attributes: ['id', 'fakultetID'],
  });
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  // 2. Build name search filter
  const userWhere = {
    role: 'STUDENT',
    approvalStatus: 'APPROVED', // samo korisnici sa STUDENT rolom
  };
  if (pretraga) {
  const dijelovi = pretraga.trim().split(/\s+/);

  if (dijelovi.length === 1) {
    // Samo jedna riječ — traži u ime ili prezime
    userWhere[Op.or] = [
      { ime:     { [Op.iLike]: `%${dijelovi[0]}%` } },
      { prezime: { [Op.iLike]: `%${dijelovi[0]}%` } },
    ];
  } else {
    // Više riječi — prva je ime, zadnja je prezime (ili obrnuto)
    const [prva, ...ostatak] = dijelovi;
    const zadnja = ostatak.join(' ');
    userWhere[Op.or] = [
      { [Op.and]: [{ ime: { [Op.iLike]: `%${prva}%` } },    { prezime: { [Op.iLike]: `%${zadnja}%` } }] },
      { [Op.and]: [{ ime: { [Op.iLike]: `%${zadnja}%` } },  { prezime: { [Op.iLike]: `%${prva}%` } }] },
    ];
  }
}

  // 3. Find students from same faculty
  const studenti = await db.Student.findAll({
    where: { fakultetID: koordinator.fakultetID },
    include: [
      {
        model: db.User,
        attributes: ['ime', 'prezime', 'email', 'role', 'status', 'approvalStatus'],
        where: userWhere,
      },
      {
        model: db.Odsjek,
        attributes: ['id', 'naziv'],
      },
      {
        model: db.PrijavaNaPraksu,
        required: false,
        attributes: ['id', 'status', 'datumPrijave'],
        include: [{
          model: db.Oglas,
          attributes: ['id', 'naziv'],
          include: [{
            model: db.Kompanija,
            attributes: ['naziv'],
          }],
        }],
      },
    ],
    attributes: ['id', 'index_number', 'year_of_study', 'odsjekID', 'fakultetID'],
  });

  return studenti;
};

// ─── getPrakse ────────────────────────────────────────────────────────────────
const getPrakse = async (status = '', koordinatorUserId) => {
  if (!db.Praksa) return [];
  const where = {};
  
  const koordinator = await db.Koordinator.findOne({
    where: { userID: koordinatorUserId },
    attributes: ['fakultetID'],
  });
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  return db.Praksa.findAll({
    where,
    include: [
      {
        model: db.PrijavaNaPraksu,
        include: [
          {
            model: db.Student,
            where: { fakultetID: koordinator.fakultetID },
            attributes: ['id', 'index_number', 'year_of_study'],
            include: [{ model: db.User, attributes: ['ime', 'prezime', 'email'] }],
          },
          {
            model: db.Oglas,
            attributes: ['id', 'naziv', 'trajanje'],
            include: [{
              model: db.Kompanija,
              attributes: ['naziv'],
            }],
          },
        ],
      },
    ],
    order: [['datumPocetka', 'DESC']],
  });
};

const { sendAccountApprovedEmail, sendAccountRejectedEmail } = require('./email.service');

const approveStudent = async (studentUserId, koordinatorUserId) => {
  // Provjeri da koordinator i student dijele isti fakultet
  const koordinator = await db.Koordinator.findOne({
    where: { userID: koordinatorUserId },
  });
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');
  
  const student = await db.Student.findOne({
    where: { userID: studentUserId, fakultetID: koordinator.fakultetID },
  });
  if (!student) throw new Error('STUDENT_NOT_FOUND_OR_WRONG_FACULTY');

  const user = await db.User.findByPk(studentUserId);
  if (!user || user.role !== 'STUDENT') throw new Error('NOT_FOUND');
  if (!user.emailVerifikovan) throw new Error('EMAIL_NOT_VERIFIED');
  if (user.approvalStatus !== 'PENDING_APPROVAL') throw new Error('INVALID_STATUS');

  user.approvalStatus = 'APPROVED';
  user.status = 'ACTIVE';
  user.approvedBy = koordinatorUserId;
  user.approvedAt = new Date();
  await user.save();

  await sendAccountApprovedEmail(user.email, user.role);
  return { id: user.id, approvalStatus: user.approvalStatus };
};

const rejectStudent = async (studentUserId, razlog, koordinatorUserId) => {
  if (!razlog?.trim()) throw new Error('RAZLOG_REQUIRED');

  const koordinator = await db.Koordinator.findOne({
    where: { userID: koordinatorUserId },
  });
  if (!koordinator) throw new Error('KOORDINATOR_NOT_FOUND');

  const student = await db.Student.findOne({
    where: { userID: studentUserId, fakultetID: koordinator.fakultetID },
  });
  if (!student) throw new Error('STUDENT_NOT_FOUND_OR_WRONG_FACULTY');

  const user = await db.User.findByPk(studentUserId);
  if (!user || user.role !== 'STUDENT') throw new Error('NOT_FOUND');
  if (!user.emailVerifikovan) throw new Error('EMAIL_NOT_VERIFIED');
  if (user.approvalStatus !== 'PENDING_APPROVAL') throw new Error('INVALID_STATUS');

  user.approvalStatus = 'REJECTED';
  user.status = 'DEACTIVATED';
  user.rejectedBy = koordinatorUserId;
  user.rejectedAt = new Date();
  user.rejectionReason = razlog.trim();
  await user.save();

  await sendAccountRejectedEmail(user.email, user.rejectionReason);
  return { id: user.id, approvalStatus: user.approvalStatus };
};

module.exports = {
  getDashboardStats,
  getPrijave,
  getPrijavaById,
  odluciOPrijavi,
  getStudenti,
  getPrakse,
  approveStudent,
  rejectStudent,
};