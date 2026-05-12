const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { getCompanyProfile, updateCompanyProfile } = require('../../business/controllers/users.controller');

router.get(
  '/company-profile',
  authenticate,
  getCompanyProfile
);

router.patch(
  '/company-profile',
  authenticate,
  updateCompanyProfile
);

module.exports = router;
