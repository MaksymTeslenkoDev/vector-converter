import '@fastify/mysql';
import 'fastify';
import { MySQLPool } from '@fastify/mysql';
import { FastifyBaseLogger } from 'fastify';
import * as fastifyMysql from '@fastify/mysql';
import {
  DeleteObjectCommandOutput,
  PutObjectCommandOutput,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import * as fastifyMultipart from '@fastify/multipart';
import { MultipartFile } from '@fastify/multipart';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      mysql: fastifyMysql.FastifyMySQLOptions;
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
      AWS_REGION:string;
    };
    s3DataSource: {
      uploadFile: (
        key: string,
        file: fastifyMultipart.MultipartFile,
      ) => Promise<PutObjectCommandOutput>;
      getFile: (key: string) => Promise<Buffer>;
      listFiles: (prefix: string) => Promise<string[]>;
      deleteFile: (key: string) => Promise<DeleteObjectCommandOutput>;
    };
  }
  interface FastifyRequest {
    multipartData?: MultipartFile;
  }
}

export interface AppOptions {
  mysql: fastifyMysql.FastifyMySQLOptions;
  s3: S3ClientConfig;
}

declare function migrate(params: {
  exec: Pick<MySQLPool, 'execute'>;
  log: FastifyBaseLogger;
}): Promise<void>;
