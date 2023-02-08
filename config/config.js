"use strict";
require("dotenv").config();
const path = require("path");
const fs = require("fs");

module.exports = {
  DEVELOPMENT: {
    username: process.env.DEVELOPMENT_DB_USERNAME,
    password: process.env.DEVELOPMENT_DB_PASSWORD,
    database: process.env.DEVELOPMENT_DB_NAME,
    host: process.env.DEVELOPMENT_DB_HOST,
    port: process.env.DEVELOPMENT_DB_PORT,
    dialect: "mysql",
    logging: console.log,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  },
  PRODUCTION: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  },
};
