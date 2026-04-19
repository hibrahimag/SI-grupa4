const router = require('express').Router();
const { applicationsPlaceholderController } = require('./applications.controller');

router.get('/', applicationsPlaceholderController);

module.exports = router;
