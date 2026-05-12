const usersService = require('../services/users.service');

function usersPlaceholderController(req, res) {
  res.status(501).json({ message: 'Users module placeholder.' });
}

async function getCompanyProfile(req, res) {
  try {
    const profile = await usersService.getCompanyProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function updateCompanyProfile(req, res) {
  try {
    const profile = await usersService.updateCompanyProfile(req.user.id, req.body || {});
    res.json({ message: 'Profil kompanije je uspješno sačuvan.', profile });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  usersPlaceholderController,
};
