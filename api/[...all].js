const app = require('../server/app');

// Vercel Serverless Function Catch-All Handler
module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Fatal API Catch-all Error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Serverless execution error: ' + (err.message || 'Unknown error')
      });
    }
  }
};
