const { Router } = require('express');

const {
  loginController,
  forgotPasswordController,
  resetPasswordController,
  getPublicFaculties,
  checkAvailability,
  register,
  verifyEmail,
  resendVerification,
} = require('../../business/controllers/auth.controller');

const router = Router();

router.get('/faculties', getPublicFaculties);
router.get('/check', checkAvailability);
router.post('/register', register);
router.post('/login', loginController);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

module.exports = router;
