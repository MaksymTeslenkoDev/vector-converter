// @ts-check

'use strict';

const fp = require('fastify-plugin');
const fastifyMysql = require('@fastify/mysql');
const migrate = require("../src/migrate");

module.exports = fp(
  async function (fastify, opts) {
    await fastify.register(fastifyMysql, {
      host: fastify.secrets.MYSQL_HOST,
      user: fastify.secrets.MYSQL_USER,
      port: fastify.secrets.MYSQL_PORT,
      database: fastify.secrets.MYSQL_DB,
      password: fastify.secrets.MYSQL_USER_PASS,
      promise:true
    });

    const mysql = fastify.mysql;

    await migrate(mysql,fastify.log)
  },
  {
    dependencies: ['application-config'],
  },
);
