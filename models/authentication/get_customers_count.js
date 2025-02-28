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

    // Extract parameters from request query
    const { companyId, branchId } = req.query; // Use req.query for GET requests

    if (!companyId || !branchId) {
      return res.status(400).json({ message: 'Missing required parameters.' });
    }

    // Create a connection pool
    const connectionPool = await connectionPoolWithRetry();

    try {
      // Execute the query using async/await
      const [results] = await connectionPool.query(queries.getAllCustomersCount, [companyId, branchId]);

      if (!results || results.length === 0) {
        console.log('Total customers fetched: 0');
        return res.status(404).json({ message: 'Customers not found' });
      }

      // Print total customers fetched to console
      console.log(`Total customers fetched: ${results.length}`);

      // Respond with the results
      res.status(200).json({ message: 'Customers fetched successfully', customers: results });

    } finally {
      connectionPool.release(); // Ensure the connection is released
    }

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getCustomersCount,
};
