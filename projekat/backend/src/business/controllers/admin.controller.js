'use strict';

const adminService = require('../services/admin.service');

async function getUsers(req, res) {
  try {
    const { status } = req.query;
    const users = await adminService.getUsers(status);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ message: 'Valid user id is required.' });
    }

    if (!role) {
      return res.status(400).json({ message: 'Field "role" is required.' });
    }

    const user = await adminService.updateUserRole(numericId, role.toUpperCase());
    res.json({ message: `Role updated to ${user.role}.`, user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { getUsers, updateUserRole };
