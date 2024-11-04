'use strict';

const { Readable } = require('node:stream');

/**
 * Helper function to stream data from S3 as a buffer.
 * @param {Readable} stream - Readable stream from S3.
 * @returns {Promise<Buffer>} - The file data as a buffer.
 */
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = {
  streamToBuffer,
};
