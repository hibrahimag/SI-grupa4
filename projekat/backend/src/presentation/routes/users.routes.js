const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const {
  getCompanyProfileController,
  updateCompanyProfileController,
  deactivationCheckController,
  deactivateAccountController,
  companyDeactivationCheckController,
  companyDeactivateAccountController,
  coordinatorDeactivationCheckController,
  coordinatorDeactivateAccountController,
} = require('../../business/controllers/users.controller');

router.get('/company-profile', authenticate, authorize('COMPANY'), getCompanyProfileController);
router.patch('/company-profile', authenticate, authorize('COMPANY'), updateCompanyProfileController);

router.get('/deactivation-check', authenticate, deactivationCheckController);
router.post('/deactivate', authenticate, deactivateAccountController);
router.get('/company-deactivation-check', authenticate, companyDeactivationCheckController);
router.post('/company-deactivate', authenticate, companyDeactivateAccountController);
router.get('/coordinator-deactivation-check', authenticate, coordinatorDeactivationCheckController);
router.post('/coordinator-deactivate', authenticate, coordinatorDeactivateAccountController);

module.exports = router;