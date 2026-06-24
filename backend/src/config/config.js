import { config } from 'dotenv';

config();

if (!process.env.PORT) {
  throw new Error('PORT is not defined');
}

if (!process.env.DB_URI) {
  throw new Error('DB_URI is not defined');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const Config = {
  PORT: process.env.PORT,
  DB_URI: process.env.DB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};
