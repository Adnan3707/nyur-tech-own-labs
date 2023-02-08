"use strict";
require("dotenv").config();
const path = require("path");
const fs = require("fs");

module.exports = {
  DEVELOPMENT: {
    CONNECT_DB: process.env.DB_DEV_URI,
  },
  PRODUCTION: {
    CONNECT_DB: process.env.DB_PROD_URI,
  },
};
