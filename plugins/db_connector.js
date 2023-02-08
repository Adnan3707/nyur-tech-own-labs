"use strict";
const fp = require("fastify-plugin");
const env = process.env.NODE_ENV || "DEVELOPMENT";
const config = require("../config/config.js")[env];
const db = require("../models/index");

async function dbConnector(fastify, opts) {
  // Connecting the Database
  let err = await db.sequelize.authenticate();
  if (err) {
    console.error("failed to connect to DB");
    console.error("ERROR: " + err);
  } else {
    console.log("Environment - " + process.env.NODE_ENV);

    console.log("Database connected to " + config.host + ":" + config.port);

    fastify.decorate("db", db);
  }
}

module.exports = fp(dbConnector);
