'use strict';

const { Jimp } = require('jimp');
const potrace = require('potrace');
const { S3FileStore } = require('../src/FileProccessor');

exports.handler = async (event) => {
  try {
    console.log('Passed event ', event);

    const { filename, potraceOptions } = event;

    if (!filename) throw new Error('filename is required');
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
      key: `origins/${filename}`,
    });

    const processedImageBuffer = await Jimp.fromBuffer(fileBuffer).then(
      (image) => {
        return image.getBuffer('image/png');
      },
    );

    const { svg } = await new Promise((resolve, reject) => {
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
      key: `converted/${filename}`,
      file: {
        toBuffer: async () => Buffer.from(svg, 'utf-8'),
        mimetype: 'image/svg+xml',
        encoding: 'utf-8',
      },
    });

    console.log("File tracing finished")

    return filename;
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
