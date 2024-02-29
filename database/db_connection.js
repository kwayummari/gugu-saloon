const mysql = require('mysql2');
const dotenv = require('dotenv');
const retry = require('retry');
// const fs = require('fs');

dotenv.config();

const createConnectionPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_TIMEOUT,
    queueLimit: 0,
    // ssl: process.env.DB_SSL === 'true' ? {
    //   ca: fs.readFileSync('path/to/ca-cert.pem'),
    //   key: fs.readFileSync('path/to/client-key.pem'),
    //   cert: fs.readFileSync('path/to/client-cert.pem'),
    // } : undefined,
  });
};

const connectionPoolWithRetry = () => {
  const operation = retry.operation({
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 30000,
    randomize: true,
  });

  return new Promise((resolve, reject) => {
    operation.attempt(() => {
      const pool = createConnectionPool();

      pool.getConnection((err, conn) => {
        if (operation.retry(err)) {
          console.error('Error connecting to MySQL database. Retrying...');
          if (conn) {
            conn.release();
          }
        } else {
          if (err) {
            console.error('Maximum retry attempts reached. Could not connect to MySQL database:', err);
            reject(err);
          } else {
            console.log('Connected to MySQL database.');
            resolve(pool);
          }
        }
      });
    });
  });
};

module.exports = connectionPoolWithRetry;
