const app = require('./app');
const { sequelize } = require('./infrastructure/database/models');

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => console.log('Baza spojena'))
  .catch((err) => console.error('Greška:', err));

sequelize
  .sync({ alter: true })
  .then(() => console.log('Tabele sinhronizovane'))
  .catch((err) => console.error('Greška pri sync:', err));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});