'use strict';

const { User, Fakultet, Koordinator, Student, Odsjek } = require('../../infrastructure/database/models');

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
  if (status === 'ACTIVE') {
    user.approvalStatus = 'APPROVED';
    user.approvedAt = new Date();
    user.rejectedAt = null;
    user.rejectedBy = null;
    user.rejectionReason = null;
  } else if (status === 'DEACTIVATED') {
    user.approvalStatus = 'REJECTED';
    user.rejectedAt = new Date();
  } else if (status === 'PENDING') {
    user.approvalStatus = 'PENDING_APPROVAL';
    user.approvalRequestedAt = new Date();
  }
  await user.save();
  return mapUser(user);
}

async function getFaculties() {
  return Fakultet.findAll({ order: [['naziv', 'ASC']] });
}

async function createFaculty({ naziv, email, adresa }) {
  if (!naziv || !naziv.trim()) {
    const err = new Error('Field "naziv" is required.');
    err.status = 400;
    throw err;
  }
  return Fakultet.create({ naziv: naziv.trim(), email: email || null, adresa: adresa || null });
}

async function updateFaculty(id, { naziv, email, adresa }) {
  const faculty = await Fakultet.findByPk(id);
  if (!faculty) {
    const err = new Error('Faculty not found.');
    err.status = 404;
    throw err;
  }
  if (naziv !== undefined) faculty.naziv = naziv.trim();
  if (email !== undefined) faculty.email = email || null;
  if (adresa !== undefined) faculty.adresa = adresa || null;
  await faculty.save();
  return faculty;
}

async function deleteFaculty(id) {
  const faculty = await Fakultet.findByPk(id);
  if (!faculty) {
    const err = new Error('Faculty not found.');
    err.status = 404;
    throw err;
  }
  const coordinatorCount = await Koordinator.count({ where: { fakultetID: id } });
  if (coordinatorCount > 0) {
    const err = new Error('Cannot delete faculty with linked coordinators.');
    err.status = 409;
    throw err;
  }
  const studentCount = await Student.count({ where: { fakultetID: id } });
  if (studentCount > 0) {
    const err = new Error('Cannot delete faculty with linked students.');
    err.status = 409;
    throw err;
  }
  await faculty.destroy();
}

async function getOdsjeci(fakultetID) {
  const faculty = await Fakultet.findByPk(fakultetID);
  if (!faculty) {
    const err = new Error('Faculty not found.');
    err.status = 404;
    throw err;
  }
  return Odsjek.findAll({ where: { fakultetID }, order: [['naziv', 'ASC']] });
}

async function createOdsjek(fakultetID, naziv) {
  if (!naziv || !naziv.trim()) {
    const err = new Error('Field "naziv" is required.');
    err.status = 400;
    throw err;
  }
  const faculty = await Fakultet.findByPk(fakultetID);
  if (!faculty) {
    const err = new Error('Faculty not found.');
    err.status = 404;
    throw err;
  }
  return Odsjek.create({ naziv: naziv.trim(), fakultetID });
}

async function deleteOdsjek(id) {
  const odsjek = await Odsjek.findByPk(id);
  if (!odsjek) {
    const err = new Error('Odsjek not found.');
    err.status = 404;
    throw err;
  }
  await odsjek.destroy();
}

module.exports = { getUsers, updateUserRole, updateUserStatus, getFaculties, createFaculty, updateFaculty, deleteFaculty, getOdsjeci, createOdsjek, deleteOdsjek };
