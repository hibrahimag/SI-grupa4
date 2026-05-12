'use strict';

const usersService = require('../services/users.service');

async function getCompanyProfile(req, res) {
  try {
    const company = await usersService.getCompanyProfile(req.user.id);
    return res.json(company);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateCompanyProfile(req, res) {
  try {
    const company = await usersService.updateCompanyProfile(req.user.id, req.body);
    return res.json(company);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}
/*
module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};
*/
const { checkDeactivation, deactivateMyAccount, checkCompanyDeactivation, deactivateCompanyAccount, checkCoordinatorDeactivation, deactivateCoordinatorAccount } = require('../services/users.service');

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
  getCompanyProfile, 
  updateCompanyProfile,
  deactivationCheckController, 
  deactivateAccountController, 
  companyDeactivationCheckController, 
  companyDeactivateAccountController, 
  coordinatorDeactivationCheckController, 
  coordinatorDeactivateAccountController };
