const mysql = require('mysql2');
const dotenv = require('dotenv');
const retry = require('retry');
// const fs = require('fs');

dotenv.config();

// Singleton pool instance
let pool = null;
let isInitializing = false;
let initializationPromise = null;

/**
 * Create MySQL connection pool with configuration
 * @returns {Object} MySQL pool
 */
const createConnectionPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // ssl: process.env.DB_SSL === 'true' ? {
    //   ca: fs.readFileSync('path/to/ca-cert.pem'),
    //   key: fs.readFileSync('path/to/client-key.pem'),
    //   cert: fs.readFileSync('path/to/client-cert.pem'),
    // } : undefined,
  });
};

/**
 * Initialize connection pool with retry logic (Singleton Pattern)
 * @returns {Promise<Object>} Promise that resolves to the connection pool
 */
const connectionPoolWithRetry = () => {
  // Return existing pool if already initialized
  if (pool) {
    return Promise.resolve(pool);
  }

  // If initialization is in progress, return the same promise
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  isInitializing = true;

  const operation = retry.operation({
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 30000,
    randomize: true,
  });

  initializationPromise = new Promise((resolve, reject) => {
    operation.attempt(() => {
      // Create pool only once
      if (!pool) {
        pool = createConnectionPool();
      }

      // Test connection
      pool.getConnection((err, conn) => {
        if (operation.retry(err)) {
          console.error('Error connecting to MySQL database. Retrying...');
          if (conn) {
            conn.release();
          }
        } else {
          if (err) {
            console.error('Maximum retry attempts reached. Could not connect to MySQL database:', err);
            pool = null; // Reset pool on failure
            isInitializing = false;
            initializationPromise = null;
            reject(err);
          } else {
            console.log('✓ Connected to MySQL database successfully.');
            if (conn) {
              conn.release();
            }
            isInitializing = false;
            resolve(pool);
          }
        }
      });
    });
  });

  return initializationPromise;
};

/**
 * Get the pool instance (for advanced use cases)
 * @returns {Object|null} Pool instance or null if not initialized
 */
const getPool = () => {
  return pool;
};

/**
 * Close the connection pool gracefully
 * @returns {Promise<void>}
 */
const closePool = () => {
  return new Promise((resolve, reject) => {
    if (!pool) {
      return resolve();
    }

    pool.end((err) => {
      if (err) {
        console.error('Error closing connection pool:', err);
        reject(err);
      } else {
        console.log('Connection pool closed successfully.');
        pool = null;
        isInitializing = false;
        initializationPromise = null;
        resolve();
      }
    });
  });
};

// Export functions
module.exports = connectionPoolWithRetry;
module.exports.getPool = getPool;
module.exports.closePool = closePool;
