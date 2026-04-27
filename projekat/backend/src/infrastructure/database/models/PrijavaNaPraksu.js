'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'PrijavaNaPraksu',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      studentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      oglasID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      koordinatorID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'PODNESENA',
          'U_RAZMATRANJU',
          'ODOBRENA',
          'ODBIJENA',
          'ODUSTAO'
        ),
        allowNull: false,
        defaultValue: 'PODNESENA',
      },
      datumPrijave: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      cv: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      motivacionoPismo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      datumOdustajanja: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      razlogOdbijanja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'prijave_na_praksu',
      timestamps: false,
    }
  );
};