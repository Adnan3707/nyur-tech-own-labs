"use strict";
const Responses = require("../../models/question_response");
const audit_trail = require("../../models/audit_trial");
const { SERVER_ERROR, SUCCESS } = require("../../config/errors.json");

module.exports = async function (fastify, opts) {
  fastify.post(
    "/listFeedback",
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
          action: "listFeedback",
          url: "/listFeedback",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body ? request.body : "NA"),
          axios_request: "",
          axios_response: "",
        };

      try {
        let questions = await Responses.find();

        //SENDING BACK RESPONSE
        reply.code(200);
        resp = {
          statusCode: 200,
          message: SUCCESS[language],
          data: questions,
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
