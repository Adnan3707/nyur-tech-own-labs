"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class audit_trail extends Model {}

  audit_trail.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      request: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      request_header: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      axios_request: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      axios_response: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      response: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "audit_trails",
    }
  );

  return audit_trail;
};
