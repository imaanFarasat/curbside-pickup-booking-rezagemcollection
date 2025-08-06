const { Sequelize } = require('sequelize');
require('dotenv').config();

// First, connect without specifying a database to create it if needed
const createDatabaseIfNotExists = async () => {
  const tempSequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    logging: false
  });

  try {
    await tempSequelize.authenticate();
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'rezagem_booking'}`);
    console.log(`Database '${process.env.DB_NAME || 'rezagem_booking'}' is ready`);
    
    await tempSequelize.close();
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
};

const sequelize = new Sequelize(
  process.env.DB_NAME || 'rezagem_booking',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
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
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    // First create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Then connect to the specific database
    await sequelize.authenticate();
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('MySQL connection error:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection }; 