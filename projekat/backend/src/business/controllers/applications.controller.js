const applicationsService = require('../services/applications.service');

function handleApplicationError(res, err) {
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Došlo je do greške na serveru.' });
}

async function createApplication(req, res) {
  try {
    const application = await applicationsService.createApplication(req.user.id, req.body);
    return res.status(201).json({
      message: 'Prijava je uspješno podnesena.',
      application,
    });
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

async function getMyApplications(req, res) {
  try {
    const applications = await applicationsService.getMyApplications(req.user.id);
    return res.json(applications);
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

module.exports = {
  createApplication,
  getMyApplications,
};
