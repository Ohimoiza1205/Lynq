import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log('Attempting MongoDB connection...');
    console.log('Connection string format check:', process.env.MONGODB_URI?.substring(0, 20) + '...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error details:', error);
    console.error('Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    process.exit(1);
  }
};