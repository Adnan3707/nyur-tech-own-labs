"use strict";
const fp = require("fastify-plugin");
const env = process.env.NODE_ENV || "DEVELOPMENT";
const config = require("../config/config.js")[env];

async function dbConnector(fastify, opts) {
  fastify.register(require("@fastify/mongodb"), {
    forceClose: true,
    url: config.CONNECT_DB,
  });
}

module.exports = fp(dbConnector);
