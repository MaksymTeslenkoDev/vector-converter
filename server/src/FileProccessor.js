const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { extname } = require('path');
const { streamToBuffer } = require('../utils/streams');

class FileStore {
  uploadFile(key, file) {
    throw new Error('Upload file should be implemented');
  }

  getFile(key) {
    throw new Error('Get file should be implemented');
  }

  listFiles(prefix) {
    throw new Error('Get list files should be implemented');
  }

  deleteFile(key) {
    throw new Error('Get delete file should be implemented');
  }
}

class S3FileStore extends FileStore {
  constructor({bucketName, options}) {
    super();
    this.provider = new S3Client(options);
    this.bucketName = bucketName;
  }

  async uploadFile({ key, file }) {
    const buffer = await file.toBuffer();
    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
      ContentEncoding: file.encoding,
    });
    return await this.provider.send(putObjectCommand);
  }

  async getFile({ key }) {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    const response = await this.provider.send(getObjectCommand);
    // @ts-ignore
    return streamToBuffer(response.Body);
  }

  async listFiles({ prefix }) {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });
    const response = await this.bucketName.send(listObjectsCommand);
    return response.Contents ? response.Contents.map((item) => item.Key) : [];
  }

  async deleteFile({ key }) {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return this.provider.send(deleteObjectCommand);
  }
}

class FileProccessor {
  #objectStore;
  constructor(storeProvider) {
    this.#objectStore = storeProvider;
  }

  setObjectStoreProvider(objectStoreProvider) {
    this.#objectStore = objectStoreProvider;
  }
  async uploadFile(params) {
    if (!params.file || !params.file.filename) {
      throw new Error('File is required');
    }
    if (!this.validateFile(params.file.filename)) {
      throw new Error(`File isn't valid`);
    }

    return await this.#objectStore.uploadFile(params);
  }

  async getFile(params) {
    return await this.#objectStore.getFile(params);
  }

  async listFiles(params) {
    return await this.#objectStore.listFiles(params);
  }

  async deleteFile(params) {
    return await this.#objectStore.deleteFils(params);
  }

  validateFile(filename) {
    return true;
  }
}

class MultipartFileProccessor extends FileProccessor {
  constructor(storeObjectParams) {
    super(new S3FileStore(storeObjectParams));
  }

  /**
   * Checks if a given file has a valid image extension (jpg or png).
   * @param {string} filename - The name of the file to check.
   * @returns {boolean} - True if the file has a valid extension, false otherwise.
   */
  validateFile(filename) {
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const fileExtension = extname(filename).toLowerCase();
    return validExtensions.includes(fileExtension);
  }
}

module.exports = {
  MultipartFileProccessor
};
