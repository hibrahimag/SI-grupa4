const router = require('express').Router();
const { notificationsPlaceholderController } = require('../../business/controllers/notifications.controller');

router.get('/', notificationsPlaceholderController);

module.exports = router;
