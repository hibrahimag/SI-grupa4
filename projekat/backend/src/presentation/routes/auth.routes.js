const { Router } = require('express');
const {
  loginController,
  forgotPasswordController,
  resetPasswordController,
} = require('../../business/controllers/auth.controller');

const router = Router();

router.post('/login', loginController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

module.exports = router;