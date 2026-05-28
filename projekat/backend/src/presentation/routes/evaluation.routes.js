'use strict';

const express = require('express');
const router = express.Router();
const evaluationController = require('../../business/controllers/evaluation.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Sve rute zahtijevaju autentifikaciju
router.use(authenticate);

// ─── Kompanija evaluira studenta (US 26) ─────────────────────────────────
// GET  /api/evaluations/company/pending    — prijave koje čekaju evaluaciju
// GET  /api/evaluations/company/submitted  — već poslane evaluacije
// POST /api/evaluations/company/:applicationId — pošalji evaluaciju studenta

router.get('/company/pending',   evaluationController.getCompanyPendingEvaluations);
router.get('/company/submitted', evaluationController.getCompanySubmittedEvaluations);
router.post('/company/:applicationId', evaluationController.postStudentEvaluation);

// ─── Student evaluira kompaniju (US 27) ──────────────────────────────────
// GET  /api/evaluations/student/pending  — kompanije koje čekaju evaluaciju
// GET  /api/evaluations/student/mine     — već poslane evaluacije kompanija
// POST /api/evaluations/student/:applicationId — pošalji evaluaciju kompanije

router.get('/student/pending', evaluationController.getStudentPendingEvaluations);
router.get('/student/mine',    evaluationController.getStudentSubmittedEvaluations);
router.post('/student/:applicationId', evaluationController.postCompanyEvaluation);
router.get('/student/received', evaluationController.getStudentReceivedEvaluations);

module.exports = router;