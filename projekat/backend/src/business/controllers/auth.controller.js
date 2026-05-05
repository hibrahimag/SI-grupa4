'use strict';

const authService = require('../services/auth.service');

async function checkAvailability(req, res) {
  try {
    const { type, value } = req.query;
    const result = await authService.checkAvailability(type, value);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getPublicFaculties(req, res) {
  try {
    const faculties = await authService.getPublicFaculties();
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function register(req, res) {
  try {
    await authService.register(req.body);
    res.status(201).json({ message: 'Registracija uspješna.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { checkAvailability, getPublicFaculties, register };
