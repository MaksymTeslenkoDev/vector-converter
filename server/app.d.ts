import '@fastify/mysql';
import 'fastify';
import { MySQLPool } from '@fastify/mysql';
import { FastifyBaseLogger } from 'fastify';
import {
  S3ClientConfig,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';

// Interface for the basic file storage provider
export interface FileStore {
  uploadFile(params: {
    key: string;
    file: MultipartFile;
  }): Promise<PutObjectCommandOutput | unknown>;
  getFile(params: { key: string }): Promise<Buffer>;
  listFiles(params: { prefix: string }): Promise<string[]>;
  deleteFile(params: {
    key: string;
  }): Promise<DeleteObjectCommandOutput | unknown>;
}

// Interface for S3-specific configuration options
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

// Typing for FileProcessor with Generics
export interface FileProcessor<T extends FileStore> {
  setObjectStoreProvider(objectStoreProvider: T): void;
  uploadFile(params: {
    key: string;
    file: MultipartFile;
  }): Promise<ReturnType<T['uploadFile']>>;
  getFile(params: { key: string }): Promise<ReturnType<T['getFile']>>;
  listFiles(params: { prefix: string }): Promise<ReturnType<T['listFiles']>>;
  deleteFile(params: { key: string }): Promise<ReturnType<T['deleteFile']>>;
  validateFile(filename: string): boolean;
}

// Specific implementation for a MultipartFile processor with S3
export interface MultipartFileProcessor extends FileProcessor<FileStore> {
  validateFile(filename: string): boolean;
}

// Fastify Instance Extension
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      mysql: import('@fastify/mysql').FastifyMySQLOptions;
      s3: S3ClientConfig;
    };
    mysql: MySQLPool;
    secrets: {
      PORT: number;
      NODE_ENV: string;
      MYSQL_HOST: string;
      MYSQL_USER: string;
      MYSQL_PORT: number;
      MYSQL_DB: string;
      MYSQL_USER_PASS: string;
      AWS_ACCESS_KEY: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
    };
    s3DataSource: MultipartFileProcessor; // Typed s3DataSource as MultipartFileProcessor
  }

  interface FastifyRequest {
    multipartData?: MultipartFile;
  }
}

export interface AppOptions {
  mysql: import('@fastify/mysql').FastifyMySQLOptions;
  s3: S3ClientConfig;
}

declare function migrate(params: {
  exec: Pick<MySQLPool, 'execute'>;
  log: FastifyBaseLogger;
}): Promise<void>;
