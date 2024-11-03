'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async function uploadSchemaLoaderPlugin(fastify, opts) {
  fastify.addSchema(require('./upload-response.json'));
});
