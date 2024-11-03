'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async function swaggerPlugin (fastify, opts) {
    fastify.register(require('@fastify/swagger'), {
      swagger: {
        info: {
          title: 'Vector convertor app',
          description: 'Convert jpg/png images into vector (svg) format',
          version: require('../package.json').version
        }
      }
    })
    // @ts-ignore
    fastify.register(require('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      exposeRoute: fastify.secrets.NODE_ENV !== 'production'
    })
  }, { dependencies: ['application-config'] })