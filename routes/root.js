"use strict";
const {
  ACCOUNT_EXISTS,
  AUTHENTICATION_INVALID,
  ACCOUNT_DOESNT_EXIST,
  ACCOUNT_DETAILS_WRONG,
  USER_ACCOUNT_DISABLED,
  SIGN_UP_SUCCESS,
  SERVER_ERROR,
  RECOVER_SUCCESS,
  DEVICE_DOESNT_EXIST,
  AUTHENTICATION_SUCCESS,
} = require("../config/errors.json");
const users = require("../models/user");
const audit_trial = require("../models/audit_trial");
const devices = require("../models/device");

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    // const users = fastify.mongo.db.collection("users");
    // console.log(users);
    // const result = await users.find({}).toArray();
    // return reply.code(200).send({
    //   message: result,
    // });
    // let user = {
    //   email: "abid@gmail.com",
    //   password: "abid@123",
    //   device: "device_id",
    // };
    // const newNote = await users.create(user);
    // console.log(newNote);
  });

  fastify.post("/", async function (request, reply) {
    // const users = this.mongo.db.collection("users");
    // const { name, age } = request.body;
    // const data = { name, age };
    // const result = await users.insertOne(data);
    // reply.code(201).send(result);
    // const users = this.mongo.db.collection("new_users");
    // const { name, age } = request.body;
    // const data = { name, age };
    // const result = await users.insertOne(data);
    // reply.code(201).send(result);
  });

  fastify.post(
    "/register",
    {
      schema: {
        description: "Register JWT",
        summary: "Register JWT",
        tags: ["JWT"],
        body: {
          $ref: "register_product#",
        },
      },
    },
    async function (request, reply) {
      let language = request.headers["accept-language"]
        ? request.headers["accept-language"]
        : "en";
      request.body.username = request.body.email;
      let data = request.body;
      let resp,
        logs = {
          email: request.body.email,
          action: "Register",
          url: "/register",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body),
          axios_request: "",
          axios_response: "",
        };

      try {
        // GETTING USER
        const user = await users.findOne({ email: data.email });

        console.log(user);
        // CHECKING USER IF ALREADY EXISTS
        if (user) {
          resp = {
            statusCode: 400,
            message: ACCOUNT_EXISTS[language],
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trial.create(logs);
          reply.code(400);
          return resp;
        }
        // CHECKING USER ENDS

        //ELSE -  HASHING THE PASSWORD
        let hashedPassword = users.setPassword(data.email, data.password);
        data.password = hashedPassword;
        // HASHING PASSWORD ENDS

        // CREATING NEW USER
        const result = await users.create(data);

        // Making JWT Payload
        let payload = {
          email: data.email,
        };

        // Generating Token
        let token = await fastify.jwtsign(payload, data.device_id, language);

        // Checking Response from JWT SIGN Plugin
        if (token.statusCode != 202) {
          logs.response = JSON.stringify(token);
          logs.status = "FAILURE";
          await audit_trial.create(logs);
          reply.code(token.statusCode || 401);
          return token;
        }

        // CREATING DEVICE DETAILS
        let deviceDetails = {
          device_id: data.device_id,
          email: data.email,
        };
        await devices.create(deviceDetails);
        // CREATING DEVICE DETAIL ENDS

        reply.code(200);
        resp = {
          statusCode: 200,
          message: SIGN_UP_SUCCESS[language],
          registered_device: data.device_id,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
        };
        logs.response = JSON.stringify(resp);
        logs.status = "SUCCESS";
        await audit_trial.create(logs);
        return resp;
      } catch (err) {
        console.error(err);
        resp = {
          statusCode: 400,
          message: SERVER_ERROR[language],
        };
        logs.response = JSON.stringify(resp);
        logs.status = "FAILURE";
        await audit_trial.create(logs);
        reply.code(400);
        return resp;
      }
    }
  );
};
