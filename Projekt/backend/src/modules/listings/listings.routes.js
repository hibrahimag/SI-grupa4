const router = require('express').Router();
const { listingsPlaceholderController } = require('./listings.controller');

router.get('/', listingsPlaceholderController);

module.exports = router;
