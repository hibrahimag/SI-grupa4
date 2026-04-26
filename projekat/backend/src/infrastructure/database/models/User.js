'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      role: { type: DataTypes.ENUM('STUDENT', 'COMPANY', 'COORDINATOR', 'ADMIN'), allowNull: false },
      status: { type: DataTypes.ENUM('PENDING', 'ACTIVE', 'DEACTIVATED'), allowNull: false, defaultValue: 'PENDING' },
      institution: { type: DataTypes.STRING(150), allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'users', timestamps: false }
  );
};
