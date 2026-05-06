'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const adminController = require('../../business/controllers/admin.controller');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.updateUserStatus);

router.get('/faculties', adminController.getFaculties);
router.post('/faculties', adminController.createFaculty);
router.put('/faculties/:id', adminController.updateFaculty);
router.delete('/faculties/:id', adminController.deleteFaculty);

module.exports = router;
