const { Router } = require('express');

const {
  loginController,
  forgotPasswordController,
  resetPasswordController,
  getPublicFaculties,
  getPublicOdsjeci,
  checkAvailability,
  register,
} = require('../../business/controllers/auth.controller');

const router = Router();

router.get('/faculties', getPublicFaculties);
router.get('/faculties/:id/odsjeci', getPublicOdsjeci);
router.get('/check', checkAvailability);
router.post('/register', register);
router.post('/login', loginController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

module.exports = router;
