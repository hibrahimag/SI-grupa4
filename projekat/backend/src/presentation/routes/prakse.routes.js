'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const prakseController = require('../../business/controllers/prakse.controller');

router.get('/mine', authenticate, authorize('STUDENT'), prakseController.getMine);
router.get('/company', authenticate, authorize('COMPANY'), prakseController.getCompany);
router.get('/coordinator', authenticate, authorize('COORDINATOR'), prakseController.getCoordinator);

module.exports = router;
