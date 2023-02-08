"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("audit_trails", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      request: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      request_header: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      axios_request: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      axios_response: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      response: {
        type: Sequelize.TEXT + " CHARSET utf8 COLLATE utf8_unicode_ci",
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("audit_trails");
  },
};
