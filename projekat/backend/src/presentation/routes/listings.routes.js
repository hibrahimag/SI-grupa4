'use strict';

const express = require('express');
const router = express.Router();

const listingsController = require('../../business/controllers/listings.controller');
//const authMiddleware = require('../../middleware/auth.middleware');
//const rbacMiddleware = require('../../middleware/rbac.middleware');

const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

router.get(
  '/active',
  authenticate,
  listingsController.getActiveListings
);

// Kreiranje oglasa
router.post(
  '/',
  authenticate,
  authorize('COMPANY'),
  listingsController.createListing
);

router.get(
  '/company',
  authenticate,
  authorize('COMPANY'),
  listingsController.getCompanyListings
);



module.exports = router;
