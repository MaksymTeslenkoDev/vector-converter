'use strict';

const {S3FileStore} = require('../src/FileProccessor');

exports.handler = async (event) => {

  const bucketName = 'vector-converter';
  const options = {
    region: process.env.AWS_REGION,
    credentials:{
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      accessKeyId:process.env.AWS_ACCESS_KEY
    }
  }

  const s3FileStor = new S3FileStore({bucketName, options});

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from AWS Lambda!',
      timestamp: new Date().toISOString(),
    }),
  };

  return response;
};