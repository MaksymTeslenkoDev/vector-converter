'use strict';

const fp = require('fastify-plugin');
const fastifyMysql = require('@fastify/mysql');
const path = require('node:path');
const migrate = require('../../src/migrate');

module.exports = fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify - The Fastify instance.
   * @param {import('../app').AppOptions} opts - The options passed to the plugin.
   */
  async function (fastify, opts) {
    await fastify.register(fastifyMysql, opts.mysql);
    const mysql = fastify.mysql;
    await migrate({
      pool: mysql,
      log: fastify.log,
      migrationsPath: path.join(__dirname, '..', 'migrations'),
    });
  },
  {
    dependencies: ['application-config'],
  },
);
