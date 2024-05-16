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
  EMAIL_ADDRESS: string;
  EMAIL_PASSWORD: string;
  SECRET_KEY: string;
  STATIC_TOKEN: string;
  CLIENT_URL: string;
  NODE_ENV: string;
  CLOUDINARY_URL: string;
  CLOUD_NAME: string;
  API_KEY: string;
  API_SECRET: string;
  STRIPE_API_KEY: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  STRIPE_ENDPOINT_SECRET: string;
  RAZORPAY_API_KEY: string;
  RAZORPAY_SECRET: string;
  RAZORPAY_CHECKOUT: string;
  KEY_ID: string;
  ORDER_ID: string;
  NAME: string;
  LOGO: string;
  CALLBACK_URL: string;
  CANCEL_URL: string;
  WEBHOOK_SECRET: string;
  CONNECTION_STRING: string;
}

export const env: Env = {
  PORT: loadAsNumber('PORT'),
  HOST: loadAsString('HOST'),
  DB_PORT: loadAsNumber('DB_PORT'),
  DB_USERNAME: loadAsString('DB_USERNAME'),
  DB_PASSWORD: loadAsString('DB_PASSWORD'),
  DB_NAME: loadAsString('DB_NAME'),
  EMAIL_ADDRESS: loadAsString('EMAIL_ADDRESS'),
  EMAIL_PASSWORD: loadAsString('EMAIL_PASSWORD'),
  SECRET_KEY: loadAsString('SECRET_KEY'),
  STATIC_TOKEN: loadAsString('STATIC_TOKEN'),
  CLIENT_URL: loadAsString('CLIENT_URL'),
  NODE_ENV: loadAsString('NODE_ENV'),
  CLOUDINARY_URL: loadAsString('CLOUDINARY_URL'),
  CLOUD_NAME: loadAsString('CLOUD_NAME'),
  API_KEY: loadAsString('API_KEY'),
  API_SECRET: loadAsString('API_SECRET'),
  STRIPE_API_KEY: loadAsString('STRIPE_API_KEY'),
  ADMIN_EMAIL: loadAsString('ADMIN_EMAIL'),
  ADMIN_PASSWORD: loadAsString('ADMIN_PASSWORD'),
  STRIPE_ENDPOINT_SECRET: loadAsString('STRIPE_ENDPOINT_SECRET'),
  RAZORPAY_API_KEY: loadAsString('RAZORPAY_API_KEY'),
  RAZORPAY_SECRET: loadAsString('RAZORPAY_SECRET'),
  RAZORPAY_CHECKOUT: loadAsString('RAZORPAY_CHECKOUT'),
  KEY_ID: loadAsString('KEY_ID'),
  ORDER_ID: loadAsString('ORDER_ID'),
  NAME: loadAsString('NAME'),
  LOGO: loadAsString('LOGO'),
  CALLBACK_URL: loadAsString('CALLBACK_URL'),
  CANCEL_URL: loadAsString('CANCEL_URL'),
  WEBHOOK_SECRET: loadAsString('CANCEL_URL'),
  CONNECTION_STRING: loadAsString('CONNECTION_STRING')
};
