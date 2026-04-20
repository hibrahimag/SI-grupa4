const router = require('express').Router();
const { usersPlaceholderController } = require('../../business/controllers/users.controller');

router.get('/', usersPlaceholderController);

module.exports = router;
