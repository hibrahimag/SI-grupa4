'use strict';

const { Notifikacija, Student } = require('../../infrastructure/database/models');

async function createNotification(studentId, prijavaId, tip, naslov, poruka) {
  if (prijavaId) {
    const exists = await Notifikacija.findOne({
      where: { student_id: studentId, prijava_id: prijavaId, tip },
    });
    if (exists) return null;
  }

  return Notifikacija.create({
    student_id: studentId,
    prijava_id: prijavaId || null,
    tip,
    naslov,
    poruka,
    procitana: false,
    created_at: new Date(),
  });
}

async function getMyNotifications(userId) {
  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) return [];

  return Notifikacija.findAll({
    where: { student_id: student.id },
    order: [['created_at', 'DESC']],
    limit: 50,
  });
}

async function markAsRead(id, userId) {
  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) return;
  await Notifikacija.update(
    { procitana: true },
    { where: { id, student_id: student.id } }
  );
}

async function markAllAsRead(userId) {
  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) return;
  await Notifikacija.update(
    { procitana: true },
    { where: { student_id: student.id, procitana: false } }
  );
}

module.exports = { createNotification, getMyNotifications, markAsRead, markAllAsRead };
