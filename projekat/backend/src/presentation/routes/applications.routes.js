const router = require('express').Router();
const applicationsController = require('../../business/controllers/applications.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

router.get(
  '/mine',
  authenticate,
  authorize('STUDENT'),
  applicationsController.getMyApplications
);

router.get(
  '/statistics',
  authenticate,
  authorize('COMPANY'),
  applicationsController.getApplicationStatistics
);

router.get(
  '/company/:oglasId',
  authenticate,
  authorize('COMPANY'),
  applicationsController.getCompanyApplicationsForListing
);

router.patch(
  '/:id/shortlist',
  authenticate,
  authorize('COMPANY'),
  applicationsController.shortlistApplication
);

router.patch(
  '/:id/approve',
  authenticate,
  authorize('COMPANY'),
  applicationsController.approveApplicationByCompany
);

router.patch(
  '/:id/reject',
  authenticate,
  authorize('COMPANY'),
  applicationsController.rejectApplicationByCompany
);

router.post(
  '/',
  authenticate,
  authorize('STUDENT'),
  applicationsController.createApplication
);

module.exports = router;
