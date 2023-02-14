"use strict";
const Chat = require("../models/chat");
const Connection = require("../models/chat_connection");

module.exports = async function (fastify, opts) {
  fastify.register(async function (fastify) {
    fastify.addHook("preValidation", async (request, reply) => {
      // check if the request is authenticated
      //   if (!request.isAuthenticated()) {
      //     await reply.code(401).send("not authenticated");
      //   }
    });

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
