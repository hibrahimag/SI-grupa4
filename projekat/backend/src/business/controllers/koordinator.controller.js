'use strict';

const koordinatorService = require('../services/koordinator.service');
const db = require('../../infrastructure/database/models');

// GET /api/koordinator/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const data = await koordinatorService.getDashboardStats();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[koordinator] getDashboardStats:', err);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
};

// GET /api/koordinator/prijave?status=PODNESENA&stranica=1
const getPrijave = async (req, res) => {
  try {
    const { status, stranica, limit } = req.query;
    const data = await koordinatorService.getPrijave({ status, stranica, limit });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[koordinator] getPrijave:', err);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
};

// GET /api/koordinator/prijave/:id
const getPrijavaDetalji = async (req, res) => {
  try {
    const data = await koordinatorService.getPrijavaById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Prijava nije pronađena.' });
    }
    console.error('[koordinator] getPrijavaDetalji:', err);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
};

// PATCH /api/koordinator/prijave/:id/odluka
// Body: { odluka: 'odobrena' | 'odbijena', razlog?: string }
const odluciPrijava = async (req, res) => {
  try {
    const { odluka, razlog = '' } = req.body;

    if (!['odobrena', 'odbijena'].includes(odluka)) {
      return res.status(400).json({ success: false, message: 'Neispravna odluka. Dozvoljeno: odobrena, odbijena.' });
    }
    if (odluka === 'odbijena' && !razlog.trim()) {
      return res.status(400).json({ success: false, message: 'Razlog odbijanja je obavezan.' });
    }

    const data = await koordinatorService.odluciOPrijavi(
      req.params.id,
      odluka,
      razlog,
      req.user.id
    );

    const poruka = odluka === 'odobrena'
      ? 'Prijava je uspješno odobrena.'
      : 'Prijava je uspješno odbijena.';

    res.json({ success: true, message: poruka, data });
  } catch (err) {
    if (err.message === 'NOT_FOUND')     return res.status(404).json({ success: false, message: 'Prijava nije pronađena.' });
    if (err.message === 'INVALID_STATUS') return res.status(400).json({ success: false, message: 'Prijava nije u statusu koji dozvoljava odluku koordinatora.' });
    console.error('[koordinator] odluciPrijava:', err);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
};

// GET /api/koordinator/studenti?pretraga=Amer
// Returns only students from the coordinator's faculty
const getStudenti = async (req, res) => {
  try {
    const data = await koordinatorService.getStudenti(
      req.user.id,                  // coordinator's userID for faculty lookup
      req.query.pretraga || ''
    );
    res.json({ success: true, data });
  } catch (err) {
    if (err.message === 'KOORDINATOR_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Koordinatorski profil nije pronađen.' });
    }
    console.error('[koordinator] getStudenti:', err);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
};

// GET /api/koordinator/prakse?status=AKTIVNA
const getPrakse = async (req, res) => {
  try {
    const data = await koordinatorService.getPrakse(req.query.status || '');
    res.json({ success: true, data });
  } catch (err) {
    console.error('[koordinator] getPrakse:', err);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
};

const approveStudent = async (req, res) => {
  try {
    const data = await koordinatorService.approveStudent(
      req.params.id,
      req.user.id
    );
    res.json({ success: true, message: 'Student je odobren.', data });
  } catch (err) {
    const map = {
      KOORDINATOR_NOT_FOUND: [404, 'Koordinatorski profil nije pronađen.'],
      STUDENT_NOT_FOUND_OR_WRONG_FACULTY: [404, 'Student nije pronađen ili nije s vašeg fakulteta.'],
      NOT_FOUND: [404, 'Korisnik nije pronađen.'],
      EMAIL_NOT_VERIFIED: [400, 'Student nije verifikovao email.'],
      INVALID_STATUS: [409, 'Zahtjev više nije na čekanju.'],
    };
    const [status, message] = map[err.message] ?? [500, 'Greška na serveru.'];
    if (status === 500) console.error('[koordinator] approveStudent:', err);
    res.status(status).json({ success: false, message });
  }
};

const rejectStudent = async (req, res) => {
  try {
    const { razlog } = req.body;
    const data = await koordinatorService.rejectStudent(
      req.params.id,
      razlog,
      req.user.id
    );
    res.json({ success: true, message: 'Student je odbijen.', data });
  } catch (err) {
    const map = {
      RAZLOG_REQUIRED: [400, 'Razlog odbijanja je obavezan.'],
      KOORDINATOR_NOT_FOUND: [404, 'Koordinatorski profil nije pronađen.'],
      STUDENT_NOT_FOUND_OR_WRONG_FACULTY: [404, 'Student nije pronađen ili nije s vašeg fakulteta.'],
      NOT_FOUND: [404, 'Korisnik nije pronađen.'],
      EMAIL_NOT_VERIFIED: [400, 'Student nije verifikovao email.'],
      INVALID_STATUS: [409, 'Zahtjev više nije na čekanju.'],
    };
    const [status, message] = map[err.message] ?? [500, 'Greška na serveru.'];
    if (status === 500) console.error('[koordinator] rejectStudent:', err);
    res.status(status).json({ success: false, message });
  }
};

const getZahtjevi = async (req, res) => {
  try {
    const { getStudentApprovalRequestsForKoordinator } = require('../services/approval.service');
    const data = await getStudentApprovalRequestsForKoordinator(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[koordinator] getZahtjevi:', err);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
};

module.exports = {
  getDashboardStats,
  getPrijave,
  getPrijavaDetalji,
  odluciPrijava,
  getStudenti,
  getPrakse,
  approveStudent,
  rejectStudent,
  getZahtjevi,
};