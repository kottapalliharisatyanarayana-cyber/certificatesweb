const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB, getStatus } = require('./db');

// Import route modules
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const eventRoutes = require('./routes/events');
const uploadRoutes = require('./routes/upload');
const templateRoutes = require('./routes/templates');
const certificateRoutes = require('./routes/certificates');

// Import models for system stats
const Student = require('./models/Student');
const Event = require('./models/Event');
const Participation = require('./models/Participation');
const Template = require('./models/Template');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads/templates directory exists
const uploadsDir = path.join(__dirname, '../uploads/templates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Core Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static asset folders
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health & System Status Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getStatus();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0'
  });
});

// Admin System Statistics Endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const [totalStudents, totalEvents, totalParticipations, activeTemplate] = await Promise.all([
      Student.countDocuments(),
      Event.countDocuments(),
      Participation.countDocuments({ participated: true }),
      Template.findOne({ is_active: true }).select('template_name template_file')
    ]);

    const dbStatus = getStatus();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalEvents,
        totalParticipations,
        activeTemplate: activeTemplate ? activeTemplate.template_name : 'None',
        dbMode: dbStatus.mode,
        dbConnected: dbStatus.connected
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system statistics: ' + err.message
    });
  }
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/certificates', certificateRoutes);

if (!process.env.VERCEL) {
  // Admin portal route alias (Local development)
  app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
  });

  // SPA fallback for student portal (Local development)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
  }
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server with automatic port fallback
const http = require('http');

const listenOnPort = (server, port, maxAttempts = 5) => {
  return new Promise((resolve, reject) => {
    let currentPort = Number(port);
    let attempts = 0;

    const tryListen = () => {
      attempts++;
      server.listen(currentPort);
    };

    server.once('listening', () => {
      resolve(currentPort);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempts < maxAttempts) {
        console.warn(`⚠️ Port ${currentPort} is currently in use. Trying next available port: ${currentPort + 1}...`);
        currentPort++;
        setTimeout(tryListen, 250);
      } else {
        reject(err);
      }
    });

    tryListen();
  });
};

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    const activePort = await listenOnPort(server, PORT);

    console.log('====================================================');
    console.log('📜 AUTOMATIC CERTIFICATE GENERATION WEB SYSTEM');
    console.log(`🌐 Server running at: http://localhost:${activePort}`);
    console.log(`🎓 Student Portal:    http://localhost:${activePort}/`);
    console.log(`🔐 Admin Dashboard:   http://localhost:${activePort}/admin`);
    console.log(`📡 Health Check:      http://localhost:${activePort}/api/health`);
    console.log('====================================================');
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

if (process.env.VERCEL) {
  connectDB().catch(err => console.error('Vercel DB connection error:', err));
} else {
  startServer();
}

module.exports = app;
