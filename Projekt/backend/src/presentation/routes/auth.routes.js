const router = require('express').Router();
const { authPlaceholderController } = require('../../business/controllers/auth.controller');

router.get('/', authPlaceholderController);

module.exports = router;
