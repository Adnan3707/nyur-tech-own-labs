"use strict";

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
};
