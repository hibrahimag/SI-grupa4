const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./presentation/routes/auth.routes');
const usersRoutes = require('./presentation/routes/users.routes');
const listingsRoutes = require('./presentation/routes/listings.routes');
const applicationsRoutes = require('./presentation/routes/applications.routes');
const notificationsRoutes = require('./presentation/routes/notifications.routes');
const adminRoutes = require('./presentation/routes/admin.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
