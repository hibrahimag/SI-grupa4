'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const { authenticate } = require('../../middleware/auth.middleware');
const { uploadDocuments } = require('../../middleware/upload.middleware');

const {
  Dokument,
  Student,
} = require('../../infrastructure/database/models');

// GET /api/dokumenti/mine
router.get('/mine', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userID: req.user.id } });
    if (!student) return res.json([]);

    const dokumenti = await Dokument.findAll({
      where: { student_id: student.id },
      order: [['created_at', 'DESC']],
    });

    return res.json(dokumenti);
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri dohvatanju dokumenata.' });
  }
});

// DELETE /api/dokumenti/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ where: { userID: req.user.id } });
    if (!student) return res.status(403).json({ message: 'Pristup odbijen.' });

    const dokument = await Dokument.findOne({
      where: { id: req.params.id, student_id: student.id },
    });
    if (!dokument) return res.status(404).json({ message: 'Dokument nije pronađen.' });

    if (dokument.file_path && fs.existsSync(dokument.file_path)) {
      fs.unlinkSync(dokument.file_path);
    }

    await dokument.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri brisanju dokumenta.' });
  }
});

// POST /api/dokumenti/attach
router.post('/attach', authenticate, async (req, res) => {
  try {
    const { oglas_id, dokument_ids } = req.body;
    if (!oglas_id || !Array.isArray(dokument_ids) || dokument_ids.length === 0) {
      return res.status(400).json({ message: 'Neispravni podaci.' });
    }

    const student = await Student.findOne({ where: { userID: req.user.id } });
    if (!student) return res.status(403).json({ message: 'Pristup odbijen.' });

    const created = (await Promise.all(
      dokument_ids.map(async (id) => {
        const doc = await Dokument.findOne({ where: { id, student_id: student.id } });
        if (!doc) return null;
        return Dokument.create({
          student_id: student.id,
          oglas_id: Number(oglas_id),
          tip_dokumenta: doc.tip_dokumenta,
          original_name: doc.original_name,
          file_name: doc.file_name,
          file_path: doc.file_path,
          mime_path: doc.mime_path,
          size: doc.size,
        });
      })
    )).filter(Boolean);

    return res.status(201).json({
      success: true,
      message: 'Dokumenti uspješno priloženi uz prijavu.',
      data: created,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri prilaganju dokumenata.' });
  }
});

// POST /api/dokumenti/upload
router.post(
  '/upload',
  authenticate,
  uploadDocuments.array('files', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Nijedan fajl nije poslan.' });
      }

      const student = await Student.findOne({ where: { userID: req.user.id } });
      if (!student) {
        return res.status(400).json({ message: 'Studentski profil nije pronađen.' });
      }

      const dokumenti = await Promise.all(
        req.files.map((file, index) => {
          const tip = Array.isArray(req.body.tip_dokumenta)
            ? req.body.tip_dokumenta[index]
            : req.body.tip_dokumenta || 'OSTALO';

          return Dokument.create({
            student_id: student.id,
            oglas_id: req.body.oglas_id || null,
            tip_dokumenta: tip,
            original_name: file.originalname,
            file_name: file.filename,
            file_path: file.path,
            mime_path: file.mimetype,
            size: file.size,
          });
        })
      );

      return res.status(201).json({
        success: true,
        message: 'Dokumenti uspješno uploadovani.',
        data: dokumenti,
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        message: 'Greška pri uploadu dokumenta.',
      });
    }
  }
);

module.exports = router;
