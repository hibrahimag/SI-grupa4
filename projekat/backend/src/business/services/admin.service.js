'use strict';

const { User } = require('../../infrastructure/database/models');

const ALLOWED_ROLES = ['STUDENT', 'COMPANY', 'COORDINATOR', 'ADMIN'];

function mapUser(u) {
  return {
    id: u.id,
    name: `${u.ime} ${u.prezime}`,
    email: u.email,
    role: u.role,
    status: u.status,
    institution: u.institution,
    created_at: u.created_at,
  };
}

async function getUsers(status) {
  const where = status ? { status: status.toUpperCase() } : {};
  const users = await User.findAll({
    where,
    attributes: ['id', 'ime', 'prezime', 'email', 'role', 'status', 'institution', 'created_at'],
    order: [['created_at', 'DESC']],
  });
  return users.map(mapUser);
}

async function updateUserRole(id, role) {
  if (!ALLOWED_ROLES.includes(role)) {
    const err = new Error(`Invalid role: ${role}. Allowed: ${ALLOWED_ROLES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  user.role = role;
  await user.save();
  return mapUser(user);
}

const ALLOWED_STATUSES = ['PENDING', 'ACTIVE', 'DEACTIVATED'];

async function updateUserStatus(id, status) {
  if (!ALLOWED_STATUSES.includes(status)) {
    const err = new Error(`Invalid status: ${status}. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  user.status = status;
  await user.save();
  return mapUser(user);
}

module.exports = { getUsers, updateUserRole, updateUserStatus };
