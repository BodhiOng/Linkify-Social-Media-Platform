const mongoose = require('mongoose');
const { cache } = require('react');
require('dotenv').config();

// Cached connection to prevent multiple connection attempts
let cachedConnection = null;

const dbConnect = async () => {
  // Check if already connected
  if (cachedConnection) {
    return cachedConnection;
  }

  // Validate MongoDB URI
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const mongoOptions = {
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };
  
  try {  
    // Attempt connection
    const connection = await mongoose.connect(process.env.MONGODB_URI, mongoOptions);

    // Log successful connection
    console.log('> Successfully connected to MongoDB.');

    // Cache the connection
    cachedConnection = connection;

    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect....');
      cachedConnection = null;
    });

    // Handle reconnection
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully.');
    });

    // Handle connection errors
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err)
    });

    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);

    // Provide more detailed error information
    if(error.name === 'MongoNetworkError') {
      console.error('Network error. Check your MongoDB server status and connection string.');
    }

    throw error;
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB connection clou=suer:', error);
    process.exit(1);
  }
};

// Handle various shutdown scenarios
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGQUIT', gracefulShutdown);

module.exports = dbConnect;
