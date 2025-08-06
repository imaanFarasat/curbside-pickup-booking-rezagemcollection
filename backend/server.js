const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for React app
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint - Add this early so Railway can check it
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Reza Gem Collection Booking API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Test API route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Database connection and sync
const initializeDatabase = async () => {
  try {
    console.log('Attempting to connect to database...');
    const { sequelize, testConnection } = require('./config/database');
    await testConnection();
    // Sync all models with database (create tables if they don't exist)
    await sequelize.sync({ force: false }); // Changed to false to preserve data
    console.log('Database synchronized');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    console.log('Server will start without database connection. Please check your database configuration.');
    return false;
  }
};

// Initialize database with retry
const startServer = async () => {
  let dbConnected = false;
  
  try {
    dbConnected = await initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
  
  // Start server regardless of database connection
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database connected: ${dbConnected}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
};

// Routes - Add these after health check with error handling
try {
  console.log('Loading routes...');
  const bookingsRouter = require('./routes/bookings');
  const slotsRouter = require('./routes/slots');
  const adminRouter = require('./routes/admin');
  
  console.log('Routers loaded, mounting...');
  app.use('/api/bookings', bookingsRouter);
  console.log('Bookings route mounted at /api/bookings');
  app.use('/api/slots', slotsRouter);
  console.log('Slots route mounted at /api/slots');
  app.use('/api/admin', adminRouter);
  console.log('Admin route mounted at /api/admin');
  console.log('All routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  console.log('Catch-all route hit:', req.path);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server with error handling
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 