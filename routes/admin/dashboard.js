"use strict";
const Questions = require("../../models/questions");
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
        message: "OUN LABS ROOT RUNNING...",
      });
    }
  );

  fastify.post(
    "/newQS",
    {
      preValidation: [fastify.rootauthorize],
    },
    async function (request, reply) {
      try {
        let qs = await Questions.create(request.body);

        //SENDING BACK RESPONSE
        reply.code(200);
        resp = {
          statusCode: 200,
          message: SUCCESS[language],
          data: qs,
        };
        logs.response = JSON.stringify(resp);
        logs.status = "SUCCESS";
        await audit_trail.create(logs);
        return resp;
      } catch (err) {
        console.error(err);
        resp = {
          statusCode: 400,
          message: SERVER_ERROR[language],
        };
        logs.response = JSON.stringify(resp);
        logs.status = "FAILURE";
        await audit_trail.create(logs);
        reply.code(400);
        return resp;
      }
    }
  );
};
