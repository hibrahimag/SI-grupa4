const router = require('express').Router();
const { usersPlaceholderController } = require('./users.controller');

router.get('/', usersPlaceholderController);

module.exports = router;
