import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { env } from '../config/env.config';

let db;

if (env.NODE_ENV === 'development') {
  const client = new Client({
    host: env.HOST,
    port: env.DB_PORT,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });

  client
    .connect()
    .then(() => {
      console.log('DB Connected Successfully');
    })
    .catch((err) => {
      console.log('Error:' + err);
    });

  db = drizzle(client);
} else if (env.NODE_ENV === 'developmentttt') {
  const client = new Client({
    connectionString: env.CONNECTION_STRING
  });

  client
    .connect()
    .then(() => {
      console.log('Second DB Connected Successfully');
    })
    .catch((err) => {
      console.log('Error connecting to second DB: ' + err);
    });

  db = drizzle(client);
}

export default db;
