const app = require('./app');
const { sequelize, PrijavaNaPraksu } = require('./infrastructure/database/models');
const { backfillApplicationStatuses } = require('./business/services/applicationStatus.service');

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true })
  .then(async () => {
    await backfillApplicationStatuses(PrijavaNaPraksu);
    console.log('Baza spojena');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Greska:', err));
