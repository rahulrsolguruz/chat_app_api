import { env } from '../config/env.config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/model/schema.ts',
  out: './drizzle',
  driver: 'pg', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    host: env.HOST,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  }
} satisfies Config;
