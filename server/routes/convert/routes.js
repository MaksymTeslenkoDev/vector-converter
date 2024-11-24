'use strict';
const { InvokeCommand } = require('@aws-sdk/client-lambda');
/**
 * @param {import("fastify").FastifyInstance} fastify
 * @param {*} opts
 */
module.exports = async function convertRoutes(fastify, opts) {
  fastify.route({
    method: 'POST',
    url: '/:filename/trace',
    schema: {
      params: fastify.getSchema('schema:convert:params'),
    },
    handler: async function traceFileAsync(request, reply) {
      const filename = request.params.filename.toString().trim();

      const payload = {
        filename,
      };
      const command = new InvokeCommand({
        FunctionName: 'VectorConverter',
        InvocationType: 'Event',
        LogType: 'Tail',
        Payload: JSON.stringify(payload),
      });

      const res = await fastify.lambda.send(command)

      reply.code(res.StatusCode);
      return res.LogResult;
    },
  });
};
