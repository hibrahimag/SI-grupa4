'use strict';

const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const { ime, prezime, username, email, password, role, institution } = req.body;

    if (!ime || !prezime || !username || !email || !password || !role) {
      return res.status(400).json({
        message: 'Polja "ime", "prezime", "username", "email", "password" i "role" su obavezna.',
      });
    }

    const data = await authService.register({
      ime,
      prezime,
      username,
      email,
      password,
      role: role.toUpperCase(),
      institution,
    });

    res.status(201).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Polja "email" i "password" su obavezna.' });
    }

    const data = await authService.login(email, password);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Query parametar "token" je obavezan.' });
    }

    const data = await authService.verifyEmail(token);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Polje "email" je obavezno.' });
    }

    const data = await authService.resendVerification(email);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
};
