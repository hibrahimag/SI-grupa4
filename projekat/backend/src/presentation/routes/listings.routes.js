const router = require('express').Router();
const { listingsPlaceholderController } = require('../../business/controllers/listings.controller');

router.get('/', listingsPlaceholderController);

module.exports = router;
