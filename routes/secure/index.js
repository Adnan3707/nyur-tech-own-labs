"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

module.exports = async function (fastify, opts) {
  fastify.get(
    "/publicKey",
    {
      schema: {
        description: "Get Public Key",
        tags: ["secure"],
        summary: "Get Public Key",
      },
    },
    async function (request, reply) {
      try {
        // This route is used to fetch public key for client encryption
        let publicCertificate = path.join(
          opts.rootDir,
          "certificates/clientEncryption"
        );
        let absolutePath = path.resolve(publicCertificate + "/public.pem");
        let publicKey = fs.readFileSync(absolutePath, "utf8");

        let replaceValue =
          process.platform === "linux"
            ? "-----BEGIN PUBLIC KEY-----\n"
            : "-----BEGIN PUBLIC KEY-----\r";
        let key = publicKey.replace(replaceValue, "");
        key = key.replace("\n-----END PUBLIC KEY-----", "");

        key = key.replace("\n-----END PUBLIC KEY-----", "");
        reply.code(200);
        console.log(key);
        return {
          statusCode: 200,
          message: "Public Key Details",
          data: {
            pubKeyValue: key,
          },
        };
      } catch (err) {
        return err;
      }
    }
  );

  fastify.post(
    "/testEncryption",
    {
      schema: {
        description: "Test Encryption",
        tags: ["secure"],
        summary: "Test Encryption",
        body: {
          type: "object",
          properties: {
            creds: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      let encrypted = await fastify.clientEncrypt(request.body.creds);
      let logs = {
        username: request.user ? request.user.username : "",
        action: "Encrypt data",
        url: "/test",
        request_header: JSON.stringify(request.headers),
        request: JSON.stringify(request.body),
        axios_request: "",
        axios_response: "",
      };
      let resp = {
        statusCode: 200,
        message: "Encrypted Data",
        data: encrypted,
      };
      logs.response = JSON.stringify(resp);
      logs.status = "SUCCESS";
      await fastify.db.audit_trail.create(logs);
      reply.code(200);
      return resp;
    }
  );
};
