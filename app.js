"use strict";

const path = require("path");
const AutoLoad = require("@fastify/autoload");

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {};

module.exports = async function (fastify, opts) {
  // saving the original path in opts
  opts = Object.assign(opts, { rootDir: __dirname });

  fastify.register(require("@fastify/formbody"));
  fastify.register(require("@fastify/cors"));
  fastify.register(require("fastify-axios"));

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "schemas"),
    options: Object.assign({}, opts),
  });
};
