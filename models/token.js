const { Model } = require("sequelize");

class Token extends Model {}

module.exports = (sequelize, DataTypes) => {
  Token.init(
    {
      token_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      token_type: {
        type: DataTypes.ENUM("ACCESS", "REFRESH"),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      token_expiry: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      device_fingerprint: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "tokens",
    }
  );
  return Token;
};
