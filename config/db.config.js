const dotenv = require('dotenv').config();
const dbURL = process.env.MONGODB_URL;

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Error connecting to MongoDB: ', err.message);
    process.exit(1);
  }
};

// export
module.exports = connectDB;