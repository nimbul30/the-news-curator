const mongoose = require('mongoose');
const config = require('./environment');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect() {
    try {
      // Simple mongoose options for personal use
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      // Connect to MongoDB
      await mongoose.connect(config.MONGODB_URI, options);

      this.isConnected = true;
      this.connectionAttempts = 0;

      console.log(`✅ Connected to MongoDB: ${this.getMaskedUri()}`);

      // Set up connection event listeners
      this.setupEventListeners();

      return true;
    } catch (error) {
      this.connectionAttempts++;
      console.error(
        `❌ MongoDB connection failed (attempt ${this.connectionAttempts}):`,
        error.message
      );

      if (this.connectionAttempts < this.maxRetries) {
        console.log(
          `🔄 Retrying connection in ${this.retryDelay / 1000} seconds...`
        );
        setTimeout(() => this.connect(), this.retryDelay);
      } else {
        console.error('💥 Max connection attempts reached. Exiting...');
        process.exit(1);
      }

      return false;
    }
  }

  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ Mongoose connection error:', error);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }
  }

  getMaskedUri() {
    // Mask sensitive information in URI for logging
    return config.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
