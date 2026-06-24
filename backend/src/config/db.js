import mongoose from 'mongoose';
import { Config } from './config.js';

export const dbConnection = () => {
  mongoose
    .connect(Config.DB_URI)
    .then(() => {
      console.log('Database connected successfully');
    })
    .catch((error) => {
      console.log('Database connection failed', error);
    });
};
