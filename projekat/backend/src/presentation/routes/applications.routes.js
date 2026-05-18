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

router.post(
  '/',
  authenticate,
  authorize('STUDENT'),
  applicationsController.createApplication
);

module.exports = router;
