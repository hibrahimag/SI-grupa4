const router = require('express').Router();
const { notificationsPlaceholderController } = require('./notifications.controller');

router.get('/', notificationsPlaceholderController);

module.exports = router;
