'use strict';

const path = require('node:path');
const AutoLoad = require('@fastify/autoload');

/**
 * @param {import('fastify').FastifyInstance} fastify - The Fastify instance.
 * @param {import('./app').AppOptions} opts - The options passed to the plugin.
 */
module.exports = async function (fastify, opts) {
  fastify.log.info('The .env file has been read %s', process.env.NODE_ENV);

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'schemas'),
    indexPattern: /^loader.js$/i,
  });

  await fastify.register(require('./configs/config'));
  fastify.log.info('Config loaded %o');

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    ignorePattern: /.*.no-load\.js/,
    indexPattern: /^no$/i,
    options: fastify.config,
  });
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    indexPattern: /.*routes(\.js|\.cjs)$/i,
    ignorePattern: /.*\.js/,
    autoHooksPattern: /.*hooks(\.js|\.cjs)$/i,
    autoHooks: true,
    cascadeHooks: true,
    options: Object.assign({}, opts),
  });
};

module.exports.options = require('./configs/server-options');
