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

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};
