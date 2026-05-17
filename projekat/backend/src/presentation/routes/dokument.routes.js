'use strict';

const express = require('express');
const router = express.Router();

const { authenticate } = require('../../middleware/auth.middleware');
const { uploadDocuments } = require('../../middleware/upload.middleware');

const {
  Dokument,
} = require('../../infrastructure/database/models');

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

        const dokumenti = await Promise.all(
        req.files.map((file, index) => {
            const tip = Array.isArray(req.body.tip_dokumenta)
            ? req.body.tip_dokumenta[index]
            : req.body.tip_dokumenta || 'OSTALO';

            return Dokument.create({
            student_id: req.user.id,
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