'use strict';

// TODO: Zamijeniti mock implementaciju pravom DB implementacijom kada baza bude gotova.
// Originalna implementacija koja koristi Sequelize modele nalazi se ispod mock bloka.

const ALLOWED_ROLES = ['STUDENT', 'COMPANY', 'COORDINATOR', 'ADMIN'];

const mockUsers = [
  {
    id: 1,
    name: 'Ana Kovač',
    email: 'ana@etf.ba',
    role: 'STUDENT',
    status: 'ACTIVE',
    institution: 'ETF Sarajevo',
    created_at: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'Mirko Perić',
    email: 'mirko@techfirma.ba',
    role: 'COMPANY',
    status: 'ACTIVE',
    institution: 'Tech d.o.o.',
    created_at: '2026-01-20T09:30:00.000Z',
  },
  {
    id: 3,
    name: 'Selma Hodžić',
    email: 'selma@etf.ba',
    role: 'COORDINATOR',
    status: 'PENDING',
    institution: 'ETF Sarajevo',
    created_at: '2026-02-01T14:00:00.000Z',
  },
  {
    id: 4,
    name: 'Admin Adminović',
    email: 'admin@etf.ba',
    role: 'ADMIN',
    status: 'ACTIVE',
    institution: null,
    created_at: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 5,
    name: 'Hana Begić',
    email: 'hana@student.ba',
    role: 'STUDENT',
    status: 'PENDING',
    institution: 'PMF Sarajevo',
    created_at: '2026-03-10T11:00:00.000Z',
  },
  {
    id: 6,
    name: 'Logos d.o.o.',
    email: 'hr@logos.ba',
    role: 'COMPANY',
    status: 'DEACTIVATED',
    institution: 'Logos d.o.o.',
    created_at: '2025-12-05T09:00:00.000Z',
  },
];

async function getUsers(status) {
  const upperStatus = status ? status.toUpperCase() : null;
  const result = upperStatus
    ? mockUsers.filter((u) => u.status === upperStatus)
    : [...mockUsers];
  return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function updateUserRole(id, role) {
  if (!ALLOWED_ROLES.includes(role)) {
    const err = new Error(`Invalid role: ${role}. Allowed: ${ALLOWED_ROLES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const user = mockUsers.find((u) => u.id === id);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  user.role = role;
  return user;
}

module.exports = { getUsers, updateUserRole };

// ─── ORIGINALNA DB IMPLEMENTACIJA ────────────────────────────────────────────
// Kada baza bude implementirana, obriši mock blok iznad i odkomentiraj ovo:
//
// const { User } = require('../../infrastructure/database/models');
//
// async function getUsers(status) {
//   const where = status ? { status: status.toUpperCase() } : {};
//   return User.findAll({
//     where,
//     attributes: ['id', 'name', 'email', 'role', 'status', 'institution', 'created_at'],
//     order: [['created_at', 'DESC']],
//   });
// }
//
// async function updateUserRole(id, role) {
//   if (!ALLOWED_ROLES.includes(role)) {
//     const err = new Error(`Invalid role: ${role}. Allowed: ${ALLOWED_ROLES.join(', ')}`);
//     err.status = 400;
//     throw err;
//   }
//   const user = await User.findByPk(id);
//   if (!user) {
//     const err = new Error('User not found.');
//     err.status = 404;
//     throw err;
//   }
//   user.role = role;
//   await user.save();
//   return user;
// }
//
// module.exports = { getUsers, updateUserRole };
