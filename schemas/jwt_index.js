"use strict";
const fp = require("fastify-plugin");
module.exports = fp(async function (fastify, opts) {
  const register = {
    $id: "register_product",
    type: "object",
    required: ["device_id", "email", "password", "product_name"],
    properties: {
      device_id: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
      product_name: { type: "string" },
    },
  };

  const auth = {
    $id: "auth",
    type: "object",
    required: ["email", "password", "device_id"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
      device_id: { type: "string" },
    },
  };

  const refresh = {
    $id: "refresh",
    type: "object",
    required: ["refresh_token", "device_id"],
    properties: {
      refresh_token: { type: "string" },
      device_id: { type: "string" },
    },
  };

  const recover = {
    $id: "recover",
    type: "object",
    required: ["email", "device_id"],
    properties: {
      email: { type: "string", format: "email" },
      device_id: { type: "string" },
    },
  };

  fastify.addSchema(register);
  fastify.addSchema(auth);
  fastify.addSchema(refresh);
  fastify.addSchema(recover);
});
