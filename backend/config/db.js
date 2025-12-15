const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided (try Railway variables first, then fallback)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_PUBLIC_URL;
    
    if (!mongoUri) {
      console.warn('⚠️  MongoDB URI not provided. Running without database.');
      console.warn('⚠️  To use MongoDB Atlas:');
      console.warn('   1. Go to https://www.mongodb.com/cloud/atlas');
      console.warn('   2. Create a free cluster');
      console.warn('   3. Get your connection string');
      console.warn('   4. Update MONGODB_URI in .env file');
      return;
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Server will continue without database.');
    console.warn('⚠️  Some features may not work properly.');
    // Don't exit, allow server to run without DB for development
  }
};

module.exports = connectDB;
