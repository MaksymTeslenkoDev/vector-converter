'use strict';

module.exports = async function coverterRoutes(fastify, opts) {
  fastify.route({
    method: 'POST',
    url: '/',
    handler: async function welcomeRoute(request, reply) {
      return "Welcome";
    },
  });
};
