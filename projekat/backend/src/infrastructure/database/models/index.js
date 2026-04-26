'use strict';

const sequelize = require('../db');
const UserModel = require('./User');

const User = UserModel(sequelize);

module.exports = { sequelize, User };
