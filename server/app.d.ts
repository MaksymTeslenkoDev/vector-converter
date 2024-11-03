import '@fastify/mysql';
import 'fastify';
import { MySQLPool } from '@fastify/mysql';
import { FastifyBaseLogger } from 'fastify';
import * as fastifyMysql from '@fastify/mysql';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      mysql: fastifyMysql.FastifyMySQLOptions;
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
    };
  }
}

export interface AppOptions {
  mysql: fastifyMysql.FastifyMySQLOptions;
  schema:any
}

declare function migrate(params: {
  exec: Pick<MySQLPool, 'execute'>;
  log: FastifyBaseLogger;
}): Promise<void>;
