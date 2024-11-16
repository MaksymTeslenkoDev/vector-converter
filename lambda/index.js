'use strict';

const { S3FileStore } = require('../src/FileProccessor');
const potrace = require('potrace');
const { Jimp } = require('jimp');

exports.handler = async (event) => {
  try {
    let parsedBody;
    if (typeof event.body === 'string') {
      parsedBody = JSON.parse(event.body);
    } else {
      parsedBody = event;
    }

    const { fileName, ...potraceOptions } = parsedBody;
    if (!fileName) throw new Error('fileName is required');
    const bucketName = 'converter-bucket';
    const options = {
      region: process.env.AWS_PERSONAL_REGION,
      credentials: {
        secretAccessKey: process.env.AWS_PERSONAL_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_PERSONAL_ACCESS_KEY,
      },
    };

    const s3FileStore = new S3FileStore({ bucketName, options });

    const fileBuffer = await s3FileStore.getFile({
      key: `origins/${fileName}`,
    });

    const processedImageBuffer = await Jimp.fromBuffer(fileBuffer).then(
      (image) => {
        return image.getBuffer('image/png');
      },
    );

    const res = await new Promise((resolve, reject) => {
      let trace = new potrace.Potrace();
      trace.setParameters(potraceOptions);

      trace.loadImage(processedImageBuffer, function (err) {
        if (err) reject(err);

        resolve({
          svg: trace.getSVG(),
          path: trace.getPathTag(),
          symbol: trace.getSymbol('traced-image'),
        });
      });
    });

    await s3FileStore.uploadFile({
      key: `converted/${fileName}`,
      file: {
        toBuffer: async () => Buffer.from(res.svg, 'utf-8'),
        mimetype: 'image/svg+xml',
        encoding: 'utf-8',
      },
    });

    return fileName;
  } catch (e) {
    let statusCode = 500;
    let errorMessage = 'Enternal error';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return {
      statusCode,
      body: {
        error: errorMessage,
      },
    };
  }
};
