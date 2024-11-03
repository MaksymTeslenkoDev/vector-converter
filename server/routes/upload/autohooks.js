'use strict';

const fp = require('fastify-plugin');
const { extname } = require('path');
const schemas = require('./schemas/loader');


module.exports = fp(async function uploadHooks(fastify, opts) {
  fastify.register(schemas);

  fastify.register(require('@fastify/multipart'));
  
  fastify.addHook('preHandler', async (request, reply) => {
    console.log('request is multipart ', request.isMultipart());
    if (!request.isMultipart()) {
      reply.code(400).send({ error: 'Request must be multipart' });
    }
    const data = await request.file();
    if (!data || !data.filename) {
      return reply.code(400).send({ error: 'File is required' });
    }
    if (!isValidImageFormat(data.filename)) {
      return reply
        .code(400)
        .send({ error: 'Only JPG and PNG formats are allowed' });
    }

    // @ts-ignore
    request.data = data;
  });
});

/**
 * Checks if a given file has a valid image extension (jpg or png).
 * @param {string} filename - The name of the file to check.
 * @returns {boolean} - True if the file has a valid extension, false otherwise.
 */
function isValidImageFormat(filename) {
  const validExtensions = ['.jpg', '.jpeg', '.png'];
  const fileExtension = extname(filename).toLowerCase();
  return validExtensions.includes(fileExtension);
}
