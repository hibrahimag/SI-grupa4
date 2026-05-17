const applicationsService = require('../services/applications.service');

async function createApplication(req, res) {
  try {
    const application = await applicationsService.createApplication(req.user.id, req.body);
    return res.status(201).json({
      message: 'Prijava je uspješno podnesena.',
      application,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function getMyApplications(req, res) {
  try {
    const applications = await applicationsService.getMyApplications(req.user.id);
    return res.json(applications);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  createApplication,
  getMyApplications,
};
