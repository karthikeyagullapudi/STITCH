import mongoose from 'mongoose';
import { Config } from './config.js';

export const dbConnection = async () => {
  try {
    const conn = await mongoose.connect(Config.DB_URI);
    console.log(`Database connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.log('Database connection failed', error);
    throw error;
  }
};
