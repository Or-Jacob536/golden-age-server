const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const WebSocket = require('ws');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const { notFound } = require('./middleware/notFoundMiddleware');
const xmlParser = require('./middleware/xmlParserMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const activitiesRoutes = require('./routes/activitiesRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const poolRoutes = require('./routes/poolRoutes');

// Initialize Express app
const app = express();

// Create HTTP server and WebSocket server
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Set security HTTP headers
app.use(helmet());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Parse XML in request body
app.use(xmlParser);

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : '*',
  credentials: true
}));

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      details: {}
    }
  }
});

// Development logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set up API routes
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/restaurant', apiLimiter, restaurantRoutes);
app.use('/api/activities', apiLimiter, activitiesRoutes);
app.use('/api/messages', apiLimiter, messagesRoutes);
app.use('/api/medical', apiLimiter, medicalRoutes);
app.use('/api/pool', apiLimiter, poolRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../public')));

  // Any routes not matched by API will serve the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');

  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'connection', 
    message: 'Connected to Golden Age WebSocket Server' 
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('Received message:', parsedMessage);
      
      // Process message based on type
      switch (parsedMessage.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        default:
          console.log('Unknown message type:', parsedMessage.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
