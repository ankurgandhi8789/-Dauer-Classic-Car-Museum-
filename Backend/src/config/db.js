const mongoose = require("mongoose");

// Reuse one connection across requests (important on Vercel serverless, where the
// same warm instance handles many requests).
const cache = global._mongoCache || (global._mongoCache = { conn: null, promise: null });

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in the environment.");
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, bufferCommands: false });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // allow a retry on the next request
    throw err;
  }
  return cache.conn;
}

module.exports = connectDB;
