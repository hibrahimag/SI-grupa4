const router = require('express').Router();
const { applicationsPlaceholderController } = require('../../business/controllers/applications.controller');

router.get('/', applicationsPlaceholderController);

module.exports = router;
