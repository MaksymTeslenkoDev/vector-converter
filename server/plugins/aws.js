'use strict';

const fp = require('fastify-plugin');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { Readable } = require('stream');

module.exports = fp(
  /**
   * @param {import('fastify').FastifyInstance} fastify - The Fastify instance.
   * @param {import('../app').AppOptions} opts - The options passed to the plugin.
   */
  async function awsS3SdkWrapper(fastify, opts) {
    const bucketName = 'vector-converter';
    const client = new S3Client(opts.s3);
    fastify.decorate('s3DataSource', {
      uploadFile: async function (key, file) {
        const buffer = await file.toBuffer();
        const putObjectCommand = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: file.mimetype,
          ContentEncoding: file.encoding,
        });
        return await client.send(putObjectCommand);
      },
      getFile: async function (key) {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        const response = await client.send(getObjectCommand);
        // @ts-ignore
        return streamToBuffer(response.Body);
      },
      listFiles: async function (prefix) {
        const listObjectsCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
        });
        const response = await client.send(listObjectsCommand);
        return response.Contents
          ? response.Contents.map((item) => item.Key)
          : [];
      },
      deleteFile: async function (key) {
        const deleteObjectCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        return client.send(deleteObjectCommand);
      },
    });
  },
  {
    name: 'aws-sdk-s3-wrapper',
  },
);

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
