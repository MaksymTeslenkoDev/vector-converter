'use strict';

module.exports = async function uploadRoutes(fastify, opts) {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      response: {
        201: fastify.getSchema('schema:upload:response')
      },
    },
    handler: async function uploadFormData(request, reply) {
      const data = request.data;
      
      reply.code(201);
      return { id: 12345};
    },
  });
};
