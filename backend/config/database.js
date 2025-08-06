const { Sequelize } = require('sequelize');
require('dotenv').config();

// Parse DATABASE_URL from Railway
const parseDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL format: mysql://username:password@host:port/database
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port || 3306,
      username: url.username,
      password: url.password,
      database: url.pathname.substring(1), // Remove leading slash
      dialect: 'mysql'
    };
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rezagem_booking',
    dialect: 'mysql'
  };
};

// Connection retry logic
const retryConnection = async (fn, maxRetries = 5, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Connection attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Get database configuration
const dbConfig = parseDatabaseUrl();

// First, connect without specifying a database to create it if needed
const createDatabaseIfNotExists = async () => {
  const tempSequelize = new Sequelize({
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    dialect: 'mysql',
    logging: false,
    retry: {
      max: 3,
      timeout: 10000
    }
  });

  try {
    await retryConnection(async () => {
      await tempSequelize.authenticate();
      console.log('Connected to MySQL server');
    });
    
    // Create database if it doesn't exist
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Database '${dbConfig.database}' is ready`);
    
    await tempSequelize.close();
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    },
    retry: {
      max: 3,
      timeout: 10000
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    console.log('Database connection details:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.username
    });

    // First create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Then connect to the specific database
    await retryConnection(async () => {
      await sequelize.authenticate();
      console.log('Connected to MySQL database');
    });
  } catch (error) {
    console.error('MySQL connection error:', error);
    console.error('Please check your database configuration and ensure the database service is running.');
    throw error;
  }
};

module.exports = { sequelize, testConnection }; 