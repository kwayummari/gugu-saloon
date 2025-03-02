const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getCustomersCount = async (req, res) => {
  try {
    // Extracting parameters from the request body
    const { companyId, branchId, orderStatus } = req.body;

    // Validate orderStatus to ensure it's 0 or 1
    if (![0, 1].includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status. It should be 0 or 1.' });
    }

    // Logging the received parameters
    console.log(`Received params - companyId: ${companyId}, branchId: ${branchId}, orderStatus: ${orderStatus}`);

    // Getting the connection pool and ensuring proper connection
    const connectionPool = await connectionPoolWithRetry();
    console.log('Connected to MySQL database.');

    // Using promise-based query for better async handling
    const [results] = await connectionPool.promise().query(
      queries.getAllCustomersCount,
      [companyId, branchId, orderStatus] // Passing the validated orderStatus
    );

    console.log('Query executed successfully.');
    console.log('Raw results:', results);

    // Checking if there are no results and returning a 404 response
    if (!results || results.length === 0) {
      console.warn('No customers found for the given parameters.');
      return res.status(404).json({ message: 'No customers found' });
    }

    // Extracting the total customer count from the results
    const totalCustomers = results.map(result => result.customerCount || 0);
    console.log(`Total customers fetched: ${totalCustomers}`);

    // Returning the total customer count in the response
    res.status(200).json({
      message: 'Customers count fetched successfully',
      totalCustomers: totalCustomers // Returning the count as an array
    });

  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getCustomersCount,
};
