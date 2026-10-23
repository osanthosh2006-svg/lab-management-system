const serverless = require('serverless-http');
const app = require('../../server');
const connectDB = require('../../config/db');

const expressHandler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  return expressHandler(event, context);
};
