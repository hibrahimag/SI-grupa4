const router = require('express').Router();
const { authPlaceholderController } = require('./auth.controller');

router.get('/', authPlaceholderController);

module.exports = router;
