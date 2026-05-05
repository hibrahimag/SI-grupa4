const router = require('express').Router();
const authController = require('../../business/controllers/auth.controller');

router.get('/faculties', authController.getPublicFaculties);
router.get('/check', authController.checkAvailability);
router.post('/register', authController.register);

module.exports = router;
