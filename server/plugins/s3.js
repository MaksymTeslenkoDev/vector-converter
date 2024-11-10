'use strict';

const fp = require('fastify-plugin');
const { MultipartFileProccessor } = require('../../src/FileProccessor');

module.exports = fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify - The Fastify instance.
   * @param {import('../app').AppOptions} opts - The options passed to the plugin.
   */
  async function awsS3SdkWrapper(fastify, opts) {
    const bucketName = 'converter-bucket';
    fastify.decorate('s3DataSource', new MultipartFileProccessor({bucketName,options:opts.s3}));
  },
  {
    name: 'aws-sdk-s3-wrapper',
  },
);
