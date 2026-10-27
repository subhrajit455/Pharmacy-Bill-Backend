const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  // Check if user still has the placeholder <db_password>
  if (uri && uri.includes('<db_password>')) {
    console.warn('\n⚠️ WARNING: Your MONGODB_URI in backend/.env contains "<db_password>".');
    console.warn('⚠️ Please replace <db_password> with your MongoDB Atlas password to connect to your Atlas cluster.');
    if (process.env.FALLBACK_MONGODB_URI) {
      console.log(`ℹ️ Attempting connection to local MongoDB fallback: ${process.env.FALLBACK_MONGODB_URI}`);
      uri = process.env.FALLBACK_MONGODB_URI;
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ MongoDB Primary Connection Failed: ${error.message}`);
    // If Atlas failed, try fallback if we haven't already
    if (uri !== process.env.FALLBACK_MONGODB_URI && process.env.FALLBACK_MONGODB_URI) {
      try {
        console.log(`🔄 Trying fallback connection: ${process.env.FALLBACK_MONGODB_URI}`);
        const fallbackConn = await mongoose.connect(process.env.FALLBACK_MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ Fallback MongoDB Connected: ${fallbackConn.connection.host}`);
        return;
      } catch (fbErr) {
        console.error(`❌ Fallback MongoDB Connection also failed: ${fbErr.message}`);
      }
    }
    console.error('👉 Tip: Ensure MongoDB service is running or check your MongoDB Atlas password & network access whitelist (0.0.0.0/0).');
  }
};

module.exports = connectDB;

