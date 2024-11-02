import '@fastify/mysql';
import 'fastify';
import { MySQLPool } from '@fastify/mysql';
import { FastifyBaseLogger } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    secrets: {
      PORT: number;
      NODE_ENV: string;
      MYSQL_HOST: string;
      MYSQL_USER: string;
      MYSQL_PORT: number;
      MYSQL_DB: string;
      MYSQL_USER_PASS: string;
    };
    mysql: MySQLPool;
  }
}

declare function migrate(params:{exec:Pick<MySQLPool,'execute'>,log:FastifyBaseLogger}):Promise<void>
