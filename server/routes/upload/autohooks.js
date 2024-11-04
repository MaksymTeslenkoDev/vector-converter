'use strict';

const fp = require('fastify-plugin');
const schemas = require('./schemas/loader');


module.exports = fp(async function uploadHooks(fastify, opts) {
  fastify.register(schemas);

  fastify.register(require('@fastify/multipart'));
  
  fastify.addHook('preHandler', async (request, reply) => {
    if (!request.isMultipart()) {
      reply.code(400).send({ error: 'Request must be multipart' });
    }

    const data = await request.file();

    request.multipartData = data
  });
});
