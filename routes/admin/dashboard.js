"use strict";
const Questions = require("../../models/questions");
const audit_trail = require("../../models/audit_trial");
const { SERVER_ERROR, SUCCESS } = require("../../config/errors.json");

module.exports = async function (fastify, opts) {
  fastify.post(
    "/",
    {
      preValidation: [fastify.rootauthorize],
    },
    async function (request, reply) {
      return reply.code(200).send({
        statusCode: 200,
        message: "DASHBOARD OUN LABS ROOT RUNNING...",
      });
    }
  );
};
