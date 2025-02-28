const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');
const { validationResult } = require('express-validator');

const getCustomersCount = async (req, res) => {
  try {
    // Validate request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // Extract parameters from request
    const { companyId, branchId } = req.query.companyId ? req.query : req.body;

    // Log received parameters
    console.log(`Received params - companyId: ${companyId}, branchId: ${branchId}`);

    // Check if required parameters are provided
    if (!companyId || !branchId) {
      return res.status(400).json({ message: 'Missing required parameters.' });
    }

    // Create a connection pool
    const pool = await connectionPoolWithRetry();
    if (!pool) {
      console.error("Failed to initialize database connection pool.");
      return res.status(500).json({ message: "Database connection error" });
    }

    let connection;
    try {
      // Get a connection from the pool
      connection = await pool.getConnection();
      console.log("Connected to MySQL database.");

      // Ensure connection object is valid before querying
      if (!connection.query) {
        console.error("Database connection issue: connection.query is undefined.");
        return res.status(500).json({ message: "Database connection error" });
      }

      // Execute the query using promise-based syntax
      const [results] = await connection.query(queries.getAllCustomersCount, [companyId, branchId]);

      if (!results || results.length === 0) {
        console.log('Total customers fetched: 0');
        return res.status(404).json({ message: 'Customers not found' });
      }

      // Log total customers fetched
      console.log(`Total customers fetched: ${results.length}`);

      // Respond with the results
      res.status(200).json({ message: 'Customers fetched successfully', customers: results });

    } catch (queryError) {
      console.error("Query execution error:", queryError);
      return res.status(500).json({ message: "Internal Server Error" });
    } finally {
      if (connection) {
        connection.release(); // Release connection back to the pool
        console.log("Connection released.");
      }
    }

  } catch (err) {
    console.error('Unexpected Error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getCustomersCount,
};
