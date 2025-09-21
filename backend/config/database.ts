import mongoose from 'mongoose';
import { logger } from '../src/utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
<<<<<<< HEAD
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lynq';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    logger.info('MongoDB Connected Successfully');
  } catch (error) {
    logger.error('MongoDB Connection Failed:', error);
=======
    console.log('Attempting MongoDB connection...');
    console.log('Connection string format check:', process.env.MONGODB_URI?.substring(0, 20) + '...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error details:', error);
    console.error('Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
>>>>>>> ec52ecf7de826d795450c42293e284d8ddebd977
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB Disconnected');
  } catch (error) {
    logger.error('MongoDB Disconnection Error:', error);
  }
};