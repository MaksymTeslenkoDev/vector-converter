'use strict';

const fp = require('fastify-plugin');
const { LambdaClient } = require('@aws-sdk/client-lambda');

module.exports = fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify - The Fastify instance.
   * @param {import('../app').AppOptions} opts - The options passed to the plugin.
   */
  async function (fastify, opts) {
    const lambda = new LambdaClient(opts.lambda);
    fastify.decorate('lambda', lambda);
  },
  {
    dependencies: ['application-config'],
  },
);
