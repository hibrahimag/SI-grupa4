'use strict';

const {
  getCompanyProfile,
  updateCompanyProfile,
  checkDeactivation,
  deactivateMyAccount,
  checkCompanyDeactivation,
  deactivateCompanyAccount,
  checkCoordinatorDeactivation,
  deactivateCoordinatorAccount,
} = require('../services/users.service');

async function getCompanyProfileController(req, res) {
  try {
    const profile = await getCompanyProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateCompanyProfileController(req, res) {
  try {
    const profile = await updateCompanyProfile(req.user.id, req.body || {});
    res.json({ message: 'Profil kompanije je uspješno sačuvan.', profile });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function deactivationCheckController(req, res) {
  try {
    const result = await checkDeactivation(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function deactivateAccountController(req, res) {
  try {
    await deactivateMyAccount(req.user.id);
    res.json({ message: 'Nalog je uspješno deaktiviran.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, code: err.code });
  }
}

async function companyDeactivationCheckController(req, res) {
  try {
    const result = await checkCompanyDeactivation(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function companyDeactivateAccountController(req, res) {
  try {
    await deactivateCompanyAccount(req.user.id);
    res.json({ message: 'Nalog je uspješno deaktiviran.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, code: err.code });
  }
}

async function coordinatorDeactivationCheckController(req, res) {
  try {
    const result = await checkCoordinatorDeactivation(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function coordinatorDeactivateAccountController(req, res) {
  try {
    await deactivateCoordinatorAccount(req.user.id);
    res.json({ message: 'Nalog je uspješno deaktiviran.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, code: err.code });
  }
}

module.exports = {
  getCompanyProfileController,
  updateCompanyProfileController,
  deactivationCheckController,
  deactivateAccountController,
  companyDeactivationCheckController,
  companyDeactivateAccountController,
  coordinatorDeactivationCheckController,
  coordinatorDeactivateAccountController,
};