const app = require('../server/app');
const { connectDB } = require('../server/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection error in Vercel function:', err);
  }
  return app(req, res);
};
