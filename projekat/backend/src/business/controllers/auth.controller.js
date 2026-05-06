// backend/src/business/controllers/auth.controller.js
const {
  loginService,
  forgotPasswordService,
  resetPasswordService,
} = require('../services/auth.service');

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
    const result = await loginService(identifier.trim(), password);
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


async function forgotPasswordController(req, res) {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ message: 'E-mail adresa je obavezna.' });
  }

  try {
    await forgotPasswordService(email.trim());

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
    return res.status(400).json({ message: 'Token je obavezan.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      message: 'Nova lozinka mora imati najmanje 8 karaktera.',
    });
  }

  try {
    await resetPasswordService(token, password);

    return res.status(200).json({
      message: 'Lozinka je uspješno promijenjena.',
    });
  } catch (err) {
    const isExpected = ['Neispravan token.', 'Token je istekao.'].includes(
      err.message
    );

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
  loginController,
  forgotPasswordController,
  resetPasswordController,
};