const mongoose = require('mongoose');

/**
 * Connects to MongoDB with retry logic and exponential backoff
 * Part of Issue #166: Database Connection Retries and Health Check Endpoint
 */
const connectDB = async () => {
  const maxRetries = parseInt(process.env.DB_MAX_RETRIES || '5');
  const retryDelayMs = parseInt(process.env.DB_RETRY_DELAY_MS || '2000');
  const uri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/groqtales';

  // Sanitize URI for logging (hide credentials)
  const sanitizedUri = uri.replace(/\/\/[^@]+@/, '//*****:*****@');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[Mongoose] Connection attempt ${attempt}/${maxRetries} to ${sanitizedUri}`
      );

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(
        `[Mongoose] MongoDB Connected: ${conn.connection.host} on attempt ${attempt}`
      );
      return;
    } catch (error) {
      const errorMessage = error.message || 'Unknown error';
      console.error(
        `[Mongoose] Attempt ${attempt}/${maxRetries} failed: ${errorMessage}`
      );

      if (attempt === maxRetries) {
        console.error(
          '[Mongoose] Max retries reached. Failed to establish connection.'
        );
        throw new Error(
          `Failed to connect to MongoDB after ${maxRetries} attempts: ${errorMessage}`
        );
      }

      // Calculate exponential backoff delay
      const delay = retryDelayMs * Math.pow(2, attempt - 1);
      console.log(`[Mongoose] Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
