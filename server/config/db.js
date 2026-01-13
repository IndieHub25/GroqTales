const mongoose = require('mongoose');

/**
 * Connects to MongoDB with retry logic and exponential backoff
 * Part of Issue #166: Database Connection Retries and Health Check Endpoint
 */
const connectDB = async (maxRetries = 5, retryDelayMs = 2000) => {
  // Ensure valid retry parameters
  const safeMaxRetries = Math.max(1, Math.floor(maxRetries));
  const safeRetryDelayMs = Math.max(100, retryDelayMs);

  const uri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/groqtales';

  // Sanitize URI for logging (hide credentials)
  const sanitizedUri = uri.replace(/\/\/[^@]+@/, '//*****:*****@');

  for (let attempt = 1; attempt <= safeMaxRetries; attempt++) {
    try {
      console.log(
        `[Mongoose] Connection attempt ${attempt}/${safeMaxRetries} to ${sanitizedUri}`
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
        `[Mongoose] Attempt ${attempt}/${safeMaxRetries} failed: ${errorMessage}`
      );

      if (attempt === safeMaxRetries) {
        console.error(
          '[Mongoose] Max retries reached. Failed to establish connection.'
        );
        throw new Error(
          `Failed to connect to MongoDB after ${safeMaxRetries} attempts: ${errorMessage}`
        );
      }

      // Calculate exponential backoff delay
      const delay = safeRetryDelayMs * Math.pow(2, attempt - 1);
      console.log(`[Mongoose] Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Closes the MongoDB connection gracefully
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Mongoose] Connection closed gracefully');
  } catch (error) {
    console.error('[Mongoose] Error closing connection:', error.message);
    throw error;
  }
};

module.exports = { connectDB, closeDB };
