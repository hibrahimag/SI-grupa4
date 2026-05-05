const { Router } = require('express');
const { loginController } = require('../../business/controllers/auth.controller');

const router = Router();

router.post('/login', loginController);

module.exports = router;