"use strict";
const { Model } = require("sequelize");
const crypto = require("crypto");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_activity: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      user_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "users",
    }
  );

  User.setPassword = function (salt, password) {
    // Username is supplied as Salt to create unique hash
    let hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return hash;
  };

  User.validatePassword = function (salt, password, old_hash) {
    // Username is supplied as Salt to create unique hash
    var hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return old_hash === hash; // Compare and return true or false based on the user data
  };

  return User;
};
