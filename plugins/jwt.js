"use strict";
const fp = require("fastify-plugin");
const { readFileSync } = require("fs");
const path = require("path");
const moment = require("moment");
var randToken = require("rand-token");
const { ACCOUNT_DOESNT_EXIST } = require("../config/errors.json");

module.exports = fp(async function (fastify, opts) {
  fastify.register(require("@fastify/jwt"), {
    secret: {
      private: readFileSync(
        `${path.join(opts.rootDir, "certificates")}/private.pem`,
        "utf8"
      ),
      public: readFileSync(
        `${path.join(opts.rootDir, "certificates")}/public.crt`,
        "utf8"
      ),
    },
    sign: {
      algorithm: "RS256",
      expiresIn: `${process.env.JWT_EXPIRY}h`, // JWT EXPIRY IN DAYS 'd'
      audience: "ci-systems",
      issuer: "centurioninvest.com",
    },
    verify: {
      audience: "ci-systems",
      issuer: "centurioninvest.com",
    },
  });

  fastify.decorate("jwtsign", async function (data, device_id, lang) {
    try {
      let language = lang ? lang : "en";
      // Throwing error incase Username does not exist
      if (!data.username) {
        throw new Error("Username required!");
      }
      if (!device_id) {
        throw new Error("Device ID required!");
      }

      // FIND IF THE USER IS ACTIVE
      let user = await fastify.db.User.findOne({
        where: { username: data.username, user_status: true },
        attributes: ["username", "user_status"],
      });

      if (!user) {
        return {
          statusCode: 401,
          message: ACCOUNT_DOESNT_EXIST[language],
        };
      }

      // Updating the user activity if the user exists
      fastify.db.User.update(
        { last_activity: new Date() },
        { where: { username: data.username } }
      );

      const access_token = fastify.jwt.sign(data);
      const refresh_token = randToken.uid(256);

      // SAVING ACCESS TOKEN WITH EXPIRY IN DAYS FROM ENV
      let expiry = moment().add(process.env.JWT_EXPIRY, "hours");
      await fastify.db.Token.create({
        username: data.username,
        token_type: "ACCESS",
        token: access_token,
        token_expiry: expiry,
        device_fingerprint: device_id,
      });

      // SAVING THE REFRESH TOKEN WITH EXPIRY OF (BASE EXPIRY+1 days in DB)
      let refreshed_days = parseInt(process.env.JWT_EXPIRY) + 1;
      let refresh_expiry = moment().add(refreshed_days, "hours");
      await fastify.db.Token.create({
        username: data.username,
        token_type: "REFRESH",
        token: refresh_token,
        token_expiry: refresh_expiry,
        device_fingerprint: device_id,
      });

      console.log("JWT TOKEN GENERATED FOR: ", data.username);
      return {
        statusCode: 202,
        message: "Token generated successfully",
        access_token: access_token,
        refresh_token: refresh_token,
      };
    } catch (err) {
      return err;
    }
  });
});
