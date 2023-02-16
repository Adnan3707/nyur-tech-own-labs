"use strict";
const { SERVER_ERROR, SUCCESS } = require("../config/errors.json");
const audit_trail = require("../models/audit_trial");
const Chat = require("../models/chat");
const Connection = require("../models/chat_connection");
const Questions = require("../models/questions");
const Responses = require("../models/question_response");

module.exports = async function (fastify, opts) {
  fastify.post("/welcome", async function (request, reply) {
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
  });

  fastify.post("/save", async function (request, reply) {
    let language = request.headers["accept-language"]
      ? request.headers["accept-language"]
      : "en";

    let resp,
      logs = {
        email: request.body.email ? request.body.email : "NA",
        action: "Save",
        url: "/save",
        request_header: JSON.stringify(request.headers),
        request: JSON.stringify(request.body),
        axios_request: "",
        axios_response: "",
      };

    try {
      await Responses.create(request.body);

      //SENDING BACK RESPONSE
      reply.code(200);
      resp = {
        statusCode: 200,
        message: SUCCESS[language],
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
  });

  fastify.register(async function (fastify) {
    /* fastify.addHook("preValidation", async (request, reply) => {
      // check if the request is authenticated
      //   if (!request.isAuthenticated()) {
      //     await reply.code(401).send("not authenticated");
      //   }
    }); */

    fastify.get(
      "/chat",
      { websocket: true },
      (connection /* SocketStream */, req /* FastifyRequest */) => {
        // Client connect
        let unique_id = new Date().valueOf();
        console.log("Client connected - ", unique_id);

        connection.socket.send(
          JSON.stringify({
            chat_id: unique_id,
            message: "Welcome to Oun Labs, You are connected!",
          })
        );

        //creating a new connection
        Connection.create({
          chat_id: unique_id,
          remarks: `Client ${unique_id} connected.`,
        });

        // Chat.create({
        //   chat_id: "UNIQUD",
        //   message: "",
        //   from: "",
        //   to: "",
        // });

        // Client message
        connection.socket.on("message", (message) => {
          console.log(`Client message: ${message}`);
          connection.socket.send(`thanks ${message}`);
        });

        // Client disconnect
        connection.socket.on("close", () => {
          console.log("Client disconnected");
        });
      }
    );
  });
};
