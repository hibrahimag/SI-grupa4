const router = require('express').Router();
const {
  register,
  login,
  verifyEmail,
  resendVerification,
} = require('../../business/controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;
