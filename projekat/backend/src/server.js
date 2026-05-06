const app = require('./app');
const { sequelize } = require('./infrastructure/database/models');

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true })
  .then(() => console.log('Baza spojena'))
  .catch((err) => console.error('Greška:', err));



app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});