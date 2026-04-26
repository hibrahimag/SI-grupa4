'use strict';

const router = require('express').Router();
const authMiddleware = require('../../middleware/auth.middleware');
const rbacMiddleware = require('../../middleware/rbac.middleware');
const adminController = require('../../business/controllers/admin.controller');

router.use(authMiddleware);
router.use(rbacMiddleware('ADMIN'));

router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

module.exports = router;
