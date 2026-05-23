'use strict';

const { Student, NotificationPreference } = require('../../infrastructure/database/models');

async function getStudentByUserId(userId) {
  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) return null;
  return student;
}

async function getOrCreatePreferences(userId) {
  const student = await getStudentByUserId(userId);
  if (!student) return null;

  const [preferences] = await NotificationPreference.findOrCreate({
    where: { student_id: student.id },
    defaults: { student_id: student.id },
  });

  return preferences;
}

async function updatePreferences(userId, data) {
  const preferences = await getOrCreatePreferences(userId);
  if (!preferences) return null;

  const allowedFields = [
    'prijava_podnesena_in_app',
    'prijava_podnesena_email',
    'prijava_odobrena_in_app',
    'prijava_odobrena_email',
    'prijava_odbijena_in_app',
    'prijava_odbijena_email',
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (typeof data[field] === 'boolean') {
      updates[field] = data[field];
    }
  }

  await preferences.update(updates);
  return preferences;
}

function canSendInApp(preferences, tip) {
  if (!preferences) return true;

  switch (tip) {
    case 'PRIJAVA_PODNESENA':
      return preferences.prijava_podnesena_in_app;

    case 'PRIJAVA_ODOBRENA':
      return preferences.prijava_odobrena_in_app;

    case 'PRIJAVA_ODBIJENA':
      return preferences.prijava_odbijena_in_app;

    default:
      return true;
  }
}

function canSendEmail(preferences, tip) {
  if (!preferences) return true;

  switch (tip) {
    case 'PRIJAVA_PODNESENA':
      return preferences.prijava_podnesena_email;

    case 'PRIJAVA_ODOBRENA':
      return preferences.prijava_odobrena_email;

    case 'PRIJAVA_ODBIJENA':
      return preferences.prijava_odbijena_email;

    default:
      return true;
  }
}

module.exports = {
  getOrCreatePreferences,
  updatePreferences,
  canSendInApp,
  canSendEmail,
};