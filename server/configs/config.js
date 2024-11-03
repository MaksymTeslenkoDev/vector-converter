const fp = require('fastify-plugin');
const fastifyEnv = require('@fastify/env');

module.exports = fp(
  async function configLoader(fastify, opts) {
    await fastify.register(fastifyEnv, {
      confKey: 'secrets',
      schema: fastify.getSchema('schema:dotenv'),
    });
    fastify.decorate('config', {
      mysql: {
        host: fastify.secrets.MYSQL_HOST,
        user: fastify.secrets.MYSQL_USER,
        port: fastify.secrets.MYSQL_PORT,
        database: fastify.secrets.MYSQL_DB,
        password: fastify.secrets.MYSQL_USER_PASS,
        promise: true,
        enableKeepAlive: true,
      },
    });
  },
  { name: 'application-config' },
);
