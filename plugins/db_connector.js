"use strict";
const fp = require("fastify-plugin");
const mongoose = require("mongoose");
const env = process.env.NODE_ENV || "DEVELOPMENT";
const config = require("../config/config.js")[env];

async function dbConnector(fastify, opts) {
  //CONNECTING TO DATABASE USING MONGOOSE
  try {
    if (env == "DEVELOPMENT") {
      // ENABLE DB DEBUG INCASE OF DEV ENV
      fastify.log.info("Database Debuging");
      mongoose.set("debug", true);
    }

    mongoose.set("strictQuery", false);

    mongoose.connect(config.CONNECT_DB);
    fastify.log.info("Database Connected");
  } catch (e) {
    console.error(e);
  }
}

module.exports = fp(dbConnector);
