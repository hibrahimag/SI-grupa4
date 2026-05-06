const { Router } = require('express');
const { loginController, getPublicFaculties, checkAvailability, register } = require('../../business/controllers/auth.controller');

const router = Router();

router.get('/faculties', getPublicFaculties);
router.get('/check', checkAvailability);
router.post('/register', register);
router.post('/login', loginController);

module.exports = router;
