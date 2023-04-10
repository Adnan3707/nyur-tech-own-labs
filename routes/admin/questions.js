"use strict";
const Questions = require("../../models/questions");
const Paths = require("../../models/paths");
const audit_trail = require("../../models/audit_trial");
const {
  SERVER_ERROR,
  PATH_DUPLICATE,
  SUCCESS,
} = require("../../config/errors.json");

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
    "/newPath_old",
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

  fastify.delete(
    "/deleteQS/:id",
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

      // get the ID from URL
      const IdOfDocumentToBeRemoved = request.params.id;

      try {
        // remove the requested document using Id
        const removedQS = await Questions.findByIdAndRemove(
          IdOfDocumentToBeRemoved
        );

        // decrease the question_no. of each document having question_no greater than the deletedDocument by one.
        await Questions.updateMany(
          { question_no: { $gt: removedQS.question_no } },
          { $inc: { question_no: -1 } }
        );

        // RESPONSE TO SEND
        reply.code(200);
        resp = {
          statusCode: 200,
          message: SUCCESS[language],
          data: removedQS,
        };

        // LOG
        logs.response = JSON.stringify(resp);
        logs.status = "SUCCESS";
        await audit_trail.create(logs);
        return resp;
      } catch (err) {
        console.error(err);

        // RESPONSE TO SEND
        resp = {
          statusCode: 500,
          message: SERVER_ERROR[language],
        };

        //  LOG
        logs.response = JSON.stringify(resp);
        logs.status = "FAILURE";
        await audit_trail.create(logs);
        reply.code(400);
        return resp;
      }
    }
  );

  fastify.patch(
    "/editQS/:id",
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

      // get the ID from URL
      const IdOfDocumentToBeEdited = request.params.id;

      // store the requested update in a required format.
      const { question } = request.body;
      const requestedUpdate = { question: question };

      try {
        // update the requested document using Id
        const editedQS = await Questions.findByIdAndUpdate(
          IdOfDocumentToBeEdited,
          requestedUpdate,
          { new: true }
        );

        // RESPONSE TO SEND
        reply.code(200);
        resp = {
          statusCode: 200,
          message: SUCCESS[language],
          data: editedQS,
        };

        // LOG
        logs.response = JSON.stringify(resp);
        logs.status = "SUCCESS";
        await audit_trail.create(logs);
        return resp;
      } catch (err) {
        console.error(err);

        // RESPONSE TO SEND
        resp = {
          statusCode: 500,
          message: SERVER_ERROR[language],
        };

        //  LOG
        logs.response = JSON.stringify(resp);
        logs.status = "FAILURE";
        await audit_trail.create(logs);
        reply.code(400);
        return resp;
      }
    }
  );
};
