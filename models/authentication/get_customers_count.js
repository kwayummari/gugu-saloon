const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');
const { validationResult } = require('express-validator'); // Assuming you're using express-validator

const getCustomersCount = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // Extract parameters from request body
    const { companyId, branchId, orderStatus } = req.body;

    // Check if the necessary parameters are provided
    if (!companyId || !branchId || !orderStatus) {
      return res.status(400).json({ message: 'Missing required parameters.' });
    }

    // Create a connection pool
    const connectionPool = await connectionPoolWithRetry();

    // Execute the query
    connectionPool.query(
      queries.getAllCustomersCount, 
      [companyId, branchId, orderStatus],
      (error, results) => {
        if (error) {
          console.log('Error executing query:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'Customers not found' });
        }

        // Respond with the results
        res.status(200).json({ message: 'Customers fetched successfully', customers: results });
      }
    );
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getCustomersCount,
};
