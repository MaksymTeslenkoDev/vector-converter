'use strict';

const fp = require('fastify-plugin');
const { extname } = require('path');
const schemas = require('./schemas/loader');


module.exports = fp(async function uploadHooks(fastify, opts) {
  fastify.register(schemas);

  fastify.register(require('@fastify/multipart'));
  
  fastify.addHook('preHandler', async (request, reply) => {
    console.log('request is multipart ', request.isMultipart());
    if (!request.isMultipart()) {
      reply.code(400).send({ error: 'Request must be multipart' });
    }

    const data = await request.file();
    if (!data || !data.filename) {
      return reply.code(400).send({ error: 'File is required' });
    }

    request.multipartData = data
  });
});
