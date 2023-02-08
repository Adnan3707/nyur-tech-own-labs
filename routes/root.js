"use strict";

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    return reply.code(200).send({
      message: "CI PUBLIC AUTH SERVER RUNNING...",
    });
  });

  fastify.post(
    "/*",
    {
      preValidation: [fastify.authorize],
    },
    async function (request, reply) {
      console.log(process.env.APP_KEY);
      console.log(process.env.BASE_URL);
      //CHECKING THE KEY AND URL
      if (!process.env.APP_KEY || !process.env.BASE_URL) {
        return reply.code(404).send({
          statusCode: 404,
          message: "KEY OR SERVICE UNAVAILABLE",
        });
      }

      if (!request.body) {
        return reply.code(404).send({
          statusCode: 404,
          message: "REQUEST BODY NOT AVAILABLE",
        });
      }

      let url = process.env.BASE_URL + request.url;
      let body = request.body;

      // APPENDING KEY LOCALLY
      body.appKey = process.env.APP_KEY;

      let response = await fastify.axios.post(url, body, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response.data);
      console.log(url);
      return response.data;
    }
  );
};
