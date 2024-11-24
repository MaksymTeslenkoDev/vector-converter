'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async function convertSchemaLoaderPlugin(fastify, opts) {
  fastify.addSchema(require('./convert-params.json'));
});
