'use strict';

const crypto = require('node:crypto');

/**
 * @typedef {import('@aws-sdk/client-s3').PutObjectCommandOutput} PutObjectCommandOutput
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
module.exports = async function uploadRoutes(fastify, opts) {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      response: {
        201: fastify.getSchema('schema:upload:response'),
      },
    },
    /**
     * @param {import("fastify").FastifyRequest} request - The Fastify request.
     * @param {import("fastify").FastifyReply} reply - The Fastify reply.
     */
    handler: async function uploadFormData(request, reply) {
      const file = request.multipartData;
      const fileName = crypto.randomUUID();

      const directory = 'origins';
      const filePath = `${directory}/${fileName}`;

      const res = /** @type {PutObjectCommandOutput} */ (
        await fastify.s3DataSource.uploadFile({ file, key: filePath })
      );

      fastify.log.info('File uploaded to s3 %o', {
        s3RequestId: res.$metadata.requestId,
        fileName,
      });
      reply.code(201);
      return { id: fileName };
    },
  });
};
