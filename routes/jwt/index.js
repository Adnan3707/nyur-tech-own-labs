"use strict";

const fs = require("fs");
const path = require("path");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const {
  ACCOUNT_EXISTS,
  AUTHENTICATION_INVALID,
  ACCOUNT_DOESNT_EXIST,
  ACCOUNT_DETAILS_WRONG,
  USER_ACCOUNT_DISABLED,
  SIGN_UP_SUCCESS,
  SERVER_ERROR,
  RECOVER_SUCCESS,
  DEVICE_DOESNT_EXIST,
  AUTHENTICATION_SUCCESS,
} = require("../../config/errors.json");

module.exports = async function (fastify, opts) {};
