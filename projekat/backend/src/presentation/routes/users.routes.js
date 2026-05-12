const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const {
  getCompanyProfile,
  updateCompanyProfile,
  usersPlaceholderController,
} = require('../../business/controllers/users.controller');

router.get('/company-profile', authenticate, authorize('COMPANY'), getCompanyProfile);
router.patch('/company-profile', authenticate, authorize('COMPANY'), updateCompanyProfile);
router.get('/', usersPlaceholderController);

module.exports = router;
