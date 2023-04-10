"use strict";
const Paths = require("../../models/paths");
const audit_trail = require("../../models/audit_trial");
const {
  SERVER_ERROR,
  PATH_DUPLICATE,
  SUCCESS,
} = require("../../config/errors.json");

module.exports = async function (fastify, opts) {
  fastify.post(
    "/newPath",
    {
      preValidation: [fastify.rootauthorize],
    },
    async function (request, reply) {
      let language = request.headers["accept-language"]
        ? request.headers["accept-language"]
        : "en";

      let resp,
        logs = {
          email: request.body.email ? request.body.email : "NA",
          action: "newPath",
          url: "/newPath",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body),
          axios_request: "",
          axios_response: "",
        };

      try {
        let qs = await Paths.create(request.body);

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
        if (err.name === "MongoServerError" && err.code === 11000) {
          // CATCH DUPLICATE PATHNAME ERROR
          resp = {
            statusCode: 400,
            message: PATH_DUPLICATE[language],
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          reply.code(400);
          return resp;
        }

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
