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
const moment = require("moment");
const users = require("../models/user");
const audit_trail = require("../models/audit_trial");
const devices = require("../models/device");
const Token = require("../models/token");

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

  fastify.post("/", async function (request, reply) {});

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
          await audit_trail.create(logs);
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
          await audit_trail.create(logs);
          reply.code(token.statusCode || 401);
          return token;
        }

        // CREATING DEVICE DETAILS
        let deviceDetails = {
          device_id: data.device_id,
          email: data.email,
        };
        await Ds.create(deviceDetails);
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
    "/refresh",
    {
      schema: {
        description: "Refresh Token",
        tags: ["JWT"],
        summary: "Refresh Token",
        body: {
          $ref: "refresh#",
        },
      },
    },
    async function (request, reply) {
      var language = request.headers["accept-language"]
        ? request.headers["accept-language"]
        : "en";

      let resp,
        logs = {
          action: "Refresh",
          url: "/refresh",
          request_header: JSON.stringify(request.headers),
          request: JSON.stringify(request.body),
          axios_request: "",
          axios_response: "",
        };

      try {
        // GETTING THE REFRESHED TOKEN FROM PARAM AND CHECKING IT ON DB
        let refreshed_token = await Token.findOneAndUpdate(
          {
            token: request.body.refresh_token,
            token_type: "REFRESH",
            device_fingerprint: request.body.device_id,
            token_status: true,
          },
          { token_status: false }
        );

        let message;
        // IF NO RECORDS ARE FOUND
        if (!refreshed_token) {
          reply.code(401);
          resp = {
            statusCode: 401,
            message: AUTHENTICATION_INVALID[language],
          };
          return resp;
        }

        //ADDING USERNAME TO THE AUDIT TRIAL LOG
        logs.email = refreshed_token.email;

        //CHECKING IF THE USER IS ACTIVE
        const userStatus = await users.findOne(
          {
            email: refreshed_token.email,
          },
          "user_status"
        );

        if (!userStatus) {
          console.warn("REFRESH AUTH:", "USER DOES NOT EXIST");
          message = ACCOUNT_DOESNT_EXIST[language];
          reply.code(401);
          throw new Error(message);
        }
        if (!userStatus.user_status) {
          console.warn(
            "USER BLOCKED OR DISABLED IN REFRESH:",
            "User account has been disabled"
          );
          reply.code(400);
          resp = {
            statusCode: 400,
            message: USER_ACCOUNT_DISABLED[language],
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          return resp;
        }

        // CHECKING TOKEN VALIDITY//
        let now = moment(new Date()); // todays date/time
        let end = moment(refreshed_token.token_expiry); // expiry date/time
        let duration = moment.duration(end.diff(now));
        let expiry_minutes = duration.asMinutes();

        if (expiry_minutes < 0) {
          reply.code(401);
          resp = {
            statusCode: 401,
            message: "Refresh token has been expired!",
          };
          logs.response = JSON.stringify(resp);
          logs.status = "FAILURE";
          await audit_trail.create(logs);
          return resp;
        }
        // REFRESH TOKEN VALIDITY CHECK ENDS//

        // GENERATING A NEW REFRESHED JWT TOKEN
        let payload = {
          email: refreshed_token.email,
        };

        // NEW REFRESHED TOKEN SIGN
        let token = await fastify.jwtsign(
          payload,
          request.body.device_id,
          language
        );

        // Checking Response from JWT SIGN Plugin
        if (token.statusCode != 202) {
          reply.code(token.statusCode || 401);
          return token;
        }

        reply.code(202);
        resp = {
          statusCode: 202,
          message: "Token refreshed successfully",
          access_token: token.access_token,
          refresh_token: token.refresh_token,
        };
        logs.response = JSON.stringify(resp);
        logs.status = "SUCCESS";
        await audit_trail.create(logs);
        return resp;
      } catch (err) {
        console.error(err);
        reply.code(400);
        resp = {
          statusCode: 400,
          message: SERVER_ERROR[language],
        };
        logs.response = JSON.stringify(resp);
        logs.status = "FAILURE";
        await audit_trail.create(logs);
        return resp;
      }
    }
  );
};
