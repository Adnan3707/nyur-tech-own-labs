"use strict";
const Paths = require("../../models/paths");
const SubPaths = require("../../models/sub_paths");
const audit_trail = require("../../models/audit_trial");
const {
  SERVER_ERROR,
  PATH_DUPLICATE,
  PATH_NOT_FOUND,
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

  fastify.post(
    "/newSubPath",
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
          action: "newSubPath",
          url: "/newSubPath",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body),
          axios_request: "",
          axios_response: "",
        };

      try {
        // GETTING PATH ID
        let primary_path = await Paths.findOne({
          _id: request.body.primary_path_id,
        });

        // IF PATH DOES NOT EXIST
        if (primary_path == null) {
          resp = {
            statusCode: 400,
            message: PATH_NOT_FOUND[language],
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          reply.code(400);
          return resp;
        }
        // PATH ID CHECK ENDS

        let data = request.body;
        data.primary_path_name = primary_path.path_name;
        let qs = await SubPaths.create(data);

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
