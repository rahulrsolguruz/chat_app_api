import dotenv from 'dotenv';
dotenv.config();

const loadAsString = (index: string): string => {
  const value: string | undefined = process.env[index];
  if (value === undefined) {
    throw new Error(`${index} must be set!`);
  }
  return value;
};

const loadAsNumber = (index: string): number => {
  const value: string | undefined = process.env[index];
  const asNumber = Number(value);
  if (value === undefined || isNaN(asNumber)) {
    throw new Error(`${index} must be set as number!`);
  }
  return asNumber;
};

interface Env {
  PORT: number;
  HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  SECRET_KEY: string;
  STATIC_TOKEN: string;
  NODE_ENV: string;
  CLOUDINARY_URL: string;
  CLOUD_NAME: string;
  API_KEY: string;
  API_SECRET: string;
  CONNECTION_STRING: string;
}

export const env: Env = {
  PORT: loadAsNumber('PORT'),
  HOST: loadAsString('HOST'),
  DB_PORT: loadAsNumber('DB_PORT'),
  DB_USERNAME: loadAsString('DB_USERNAME'),
  DB_PASSWORD: loadAsString('DB_PASSWORD'),
  DB_NAME: loadAsString('DB_NAME'),
  SECRET_KEY: loadAsString('SECRET_KEY'),
  STATIC_TOKEN: loadAsString('STATIC_TOKEN'),
  NODE_ENV: loadAsString('NODE_ENV'),
  CLOUDINARY_URL: loadAsString('CLOUDINARY_URL'),
  CLOUD_NAME: loadAsString('CLOUD_NAME'),
  API_KEY: loadAsString('API_KEY'),
  API_SECRET: loadAsString('API_SECRET'),
  CONNECTION_STRING: loadAsString('CONNECTION_STRING')
};
