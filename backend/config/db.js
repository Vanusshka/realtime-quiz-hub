const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Railway auto-generates these environment variables when you add a MongoDB service
    const mongoUri = process.env.MONGODB_URI || 
                     process.env.MONGO_URL || 
                     process.env.MONGO_PUBLIC_URL ||
                     process.env.DATABASE_URL ||
                     process.env.MONGODB_URL; // Railway sometimes uses this
    
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables.');
      console.error('❌ To fix this:');
      console.error('   1. Go to Railway dashboard');
      console.error('   2. Click "New" → "Database" → "Add MongoDB"');
      console.error('   3. Railway will auto-set MONGODB_URI variable');
      console.error('   4. Redeploy your service');
      throw new Error('Database configuration missing - add MongoDB service in Railway');
    }

    console.log('🔄 Connecting to Railway MongoDB...');
    console.log('📍 URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // 15 second timeout for Railway
      socketTimeoutMS: 45000, // 45 second socket timeout
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
    });

    console.log(`✅ Railway MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping successful');
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('Authentication failed')) {
      console.error('❌ Database authentication failed.');
      console.error('💡 Try removing and re-adding the MongoDB service in Railway');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('❌ Cannot reach Railway MongoDB service.');
      console.error('💡 Check if MongoDB service is running in Railway dashboard');
    } else if (error.message.includes('timeout')) {
      console.error('❌ Connection timeout to Railway MongoDB.');
      console.error('💡 Railway MongoDB might be starting up, try again in a moment');
    }
    
    console.error('❌ Server cannot start without database connection.');
    process.exit(1); // Exit in production if DB fails
  }
};

module.exports = connectDB;
