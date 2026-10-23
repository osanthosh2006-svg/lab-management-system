const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/labtrack';

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri)
      .then(() => {
        console.log(`[db] connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
        return mongoose.connection;
      })
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;
