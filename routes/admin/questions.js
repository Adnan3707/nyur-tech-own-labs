"use strict";
const Questions = require("../../models/questions");
const audit_trail = require("../../models/audit_trial");
const { SERVER_ERROR, SUCCESS } = require("../../config/errors.json");

module.exports = async function (fastify, opts) {
  fastify.post(
    "/listQS",
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
          action: "listQS",
          url: "/listQS",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body ? request.body : "NA"),
          axios_request: "",
          axios_response: "",
        };

      try {
        let questions = await Questions.find();

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

  fastify.post(
    "/newQS",
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
          action: "Welcome",
          url: "/welcome",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body),
          axios_request: "",
          axios_response: "",
        };

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

  fastify.post(
    "/newMultiQS",
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
          action: "Welcome",
          url: "/welcome",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body),
          axios_request: "",
          axios_response: "",
        };

      try {
        let qs = await Questions.insertMany(request.body.questions);
        console.log("Questions: ", request.body.questions);
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
