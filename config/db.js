const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers to ensure Node.js c-ares reliably resolves MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // fallback to system default
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
