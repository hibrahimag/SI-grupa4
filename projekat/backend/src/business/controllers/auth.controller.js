// backend/src/business/controllers/auth.controller.js
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

/**
 * POST /api/auth/login
 *
 * Body: { identifier: string, password: string }
 */
async function loginController(req, res) {
  const { identifier, password } = req.body;

  // ── Basic presence validation (shape check before hitting the service) ──
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
    // loginService throws user-facing Bosnian messages for all expected
    // failures (wrong credentials, deactivated, pending).
    // Unexpected errors fall through to the 500 branch.
    const isExpected = [
      'Pogrešno korisničko ime/e-mail ili lozinka.',
      'Vaš nalog je deaktiviran. Kontaktirajte administratora.',
      'Vaš nalog još nije aktivan. Sačekajte odobrenje administratora.',
    ].includes(err.message);

    if (isExpected) {
      return res.status(401).json({ message: err.message });
    }

    console.error('[auth.controller] Unexpected error during login:', err);
    return res.status(500).json({
      message: 'Došlo je do greške na serveru. Pokušajte ponovo.',
    });
  }
}

module.exports = { checkAvailability, getPublicFaculties, register, loginController };
