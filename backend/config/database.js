// config/database.js - MongoDB Connection
import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection options
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Handle MongoDB disconnection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle Node process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});