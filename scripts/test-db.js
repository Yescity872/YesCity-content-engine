const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function test() {
  console.log("Testing connection to:", uri.split('@')[1]); // Don't log credentials
  try {
    await mongoose.connect(uri);
    console.log("✅ Successfully connected to MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed!");
    console.error(err);
    process.exit(1);
  }
}

test();
