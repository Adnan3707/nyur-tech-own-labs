"use strict";
const fp = require("fastify-plugin");
const Bearer = require("permit").Bearer;
// const Basic = require("permit").Basic;
const moment = require("moment");
const {
  USER_ACCOUNT_DISABLED,
  AUTHENTICATION_INVALID,
  ACCOUNT_DOESNT_EXIST,
} = require("../config/errors.json");

module.exports = fp(async function (fastify, opts) {
  const permit = new Bearer();

  fastify
    .decorate("authorize", async function (request, reply) {
      // console.log("=======BODY=======", request.body);
      var message,
        language = request.headers["accept-language"]
          ? request.headers["accept-language"]
          : "en";

      // Finding the Bearer Token in Authorization Header
      const token = permit.check(request.raw);
      console.log("==================TOKEN", token);
      // No token found, so ask for authentication.
      if (!token) {
        console.log("AUTHORIZE: NO TOKEN FOUND");
        permit.fail(reply.raw);
        throw new Error("Authorization required!");
      }

      // Verifying the authenticity of the Token
      const jwt_payload = await request.jwtVerify();
      const user = await fastify.db.User.findOne({
        where: {
          username: jwt_payload.username,
        },
        attributes: ["user_status"],
      });

      if (!user) {
        console.log("BASIC AUTH: USER DOES NOT EXIST");
        message = language
          ? ACCOUNT_DOESNT_EXIST[language]
          : ACCOUNT_DOESNT_EXIST.en;
        permit.fail(reply.raw);
        throw new Error(message);
      }
      if (!user.user_status) {
        console.log("USER BLOCKED OR DISABLED: User account has been disabled");
        // permit.fail(reply.res);
        message = language
          ? USER_ACCOUNT_DISABLED[language]
          : USER_ACCOUNT_DISABLED.en;
        reply.code(405);
        throw new Error(message);
      }

      console.log("=============", jwt_payload);

      //CHECKING FOR THE BODY FORMAT
      if (!request.body) {
        permit.fail(reply.raw);
        throw new Error("Invalid Form Body");
      }

      //CHECKING FOR THE DEVICE ID PARAM
      if (!request.body.device_id) {
        console.log(
          "CUSTOMER AUTHORIZE: " + jwt_payload.username + " DEVICE ID MISSING"
        );
        permit.fail(reply.raw);
        throw new Error("body should have required property 'device_id'");
      }

      // Double Checking the Token Identification from DB
      const token_data = await fastify.db.Token.findOne({
        where: {
          token: token,
          username: jwt_payload.username,
          device_fingerprint: request.body.device_id,
        },
        attributes: ["username", "token_expiry"],
      });

      // IF NOT RECORD FOUND IN DB
      if (!token_data) {
        console.log(
          "AUTHORIZE: " +
            jwt_payload.username +
            " TOKEN NOT AVAILABLE IN DATABASE"
        );
        message = language
          ? AUTHENTICATION_INVALID[language]
          : AUTHENTICATION_INVALID.en;
        permit.fail(reply.raw);
        throw new Error(message);
      }

      // CHECKING TOKEN VALIDITY
      let now = moment(new Date()); // todays date/time
      let end = moment(token_data.token_expiry); // expiry date/time
      let duration = moment.duration(end.diff(now));
      let expiry_minutes = duration.asMinutes();

      if (expiry_minutes < 0) {
        console.log(
          "AUTHORIZE: " +
            " TOKEN EXPIRED IN THE DATABASE FOR " +
            jwt_payload.username
        );
        permit.fail(reply.raw);
        throw new Error("Signed authorization token expired");
      }

      // TOKEN VALIDITY CHECK ENDS

      console.log(
        "AUTHORIZE: " + jwt_payload.username + " AUTHORIZED SUCCESSFULLY"
      );

      // UPDATING LAST ACTIVITY OF THE USER
      fastify.db.User.update(
        { last_activity: new Date() },
        { where: { username: jwt_payload.username } }
      );

      // Authentication succeeded, save the context and proceed...
      request.user = jwt_payload;
    })
    .register(require("@fastify/auth"));
});
