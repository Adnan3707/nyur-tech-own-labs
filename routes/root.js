"use strict";

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    const users = fastify.mongo.db.collection("users");
    console.log(users);
    const result = await users.find({}).toArray();
    return reply.code(200).send({
      message: result,
    });
  });

  fastify.post("/", async function (request, reply) {
    const users = this.mongo.db.collection("users");
    const { name, age } = request.body;
    const data = { name, age };
    const result = await users.insertOne(data);
    reply.code(201).send(result);
  });
};
