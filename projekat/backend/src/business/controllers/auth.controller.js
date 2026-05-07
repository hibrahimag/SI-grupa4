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

async function getPublicOdsjeci(req, res) {
  try {
    const odsjeci = await authService.getPublicOdsjeci(Number(req.params.id));
    res.json(odsjeci);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
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

async function loginController(req, res) {
  const { identifier, password } = req.body;

  if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
    return res.status(400).json({
      message: 'Korisničko ime ili e-mail adresa su obavezni.',
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Lozinka je obavezna.' });
  }

  try {
    const result = await authService.loginService(identifier.trim(), password);
    return res.status(200).json(result);
  } catch (err) {
    const isExpected = [
      'Pogrešno korisničko ime/e-mail ili lozinka.',
      'Vaš nalog je deaktiviran. Kontaktirajte administratora.',
      'Vaš nalog još nije aktivan. Sačekajte odobrenje administratora.',
      'Vaš korisnički račun čeka odobrenje administratora ili koordinatora.',
      'Vaš korisnički račun još nije odobren.',
    ].includes(err.message);

    if (isExpected || err.message.startsWith('Vaš zahtjev je odbijen.')) {
      return res.status(401).json({ message: err.message });
    }

    console.error('[auth.controller] Unexpected error during login:', err);
    return res.status(500).json({
      message: 'Došlo je do greške na serveru. Pokušajte ponovo.',
    });
  }
}

async function forgotPasswordController(req, res) {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({
      message: 'E-mail adresa je obavezna.',
    });
  }

  try {
    await authService.forgotPasswordService(email.trim());
    return res.status(200).json({
      message: 'Ako nalog postoji, link za reset lozinke je poslan na e-mail.',
    });
  } catch (err) {
    console.error('[auth.controller] Password reset request error:', err);
    return res.status(500).json({
      message: 'Došlo je do greške pri slanju reset linka.',
    });
  }
}

async function resetPasswordController(req, res) {
  const { token, password } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      message: 'Token je obavezan.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      message: 'Nova lozinka mora imati najmanje 8 karaktera.',
    });
  }

  try {
    await authService.resetPasswordService(token, password);
    return res.status(200).json({
      message: 'Lozinka je uspješno promijenjena.',
    });
  } catch (err) {
    const isExpected = ['Neispravan token.', 'Token je istekao.'].includes(err.message);
    if (isExpected) {
      return res.status(400).json({ message: err.message });
    }
    console.error('[auth.controller] Password reset error:', err);
    return res.status(500).json({
      message: 'Došlo je do greške pri resetovanju lozinke.',
    });
  }
}

module.exports = {
  checkAvailability,
  getPublicFaculties,
  getPublicOdsjeci,
  register,
  loginController,
  forgotPasswordController,
  resetPasswordController,
};
