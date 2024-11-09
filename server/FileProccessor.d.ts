// fileInterfaces.d.ts

import { MultipartFile } from '@fastify/multipart';

// Interface for FileStore (base class for file storage providers)
export interface FileStore {
  uploadFile(params: { key: string; file: MultipartFile }): Promise<unknown>;
  getFile(params: { key: string }): Promise<Buffer>;
  listFiles(params: { prefix: string }): Promise<string[]>;
  deleteFile(params: { key: string }): Promise<unknown>;
}

// Interface for S3FileStore Options
export interface S3FileStoreOptions {
  bucketName: string;
  options: {
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
}

// FileProcessor with Generic Support for Any FileStore
export interface FileProcessor<T extends FileStore> {
  setObjectStoreProvider(objectStoreProvider: T): void;
  uploadFile(params: {
    key: string;
    file: MultipartFile;
  }): ReturnType<T['uploadFile']>;
  getFile(params: { key: string }): ReturnType<T['getFile']>;
  listFiles(params: { prefix: string }): ReturnType<T['listFiles']>;
  deleteFile(params: { key: string }): ReturnType<T['deleteFile']>;
  validateFile(filename: string): boolean;
}

// MultipartFileProcessor specialization of FileProcessor for S3FileStore
export interface MultipartFileProcessor extends FileProcessor<FileStore> {
  validateFile(filename: string): boolean;
}
