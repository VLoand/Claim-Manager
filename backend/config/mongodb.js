import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected) {
    console.log('✅ Already connected to MongoDB');
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance_claims_files';
    
    await mongoose.connect(mongoUri);

    isConnected = true;
    console.log('✅ Connected to MongoDB database');
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📤 MongoDB disconnected');
      isConnected = false;
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📤 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export { mongoose };