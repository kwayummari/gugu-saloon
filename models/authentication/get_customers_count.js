const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getCustomersCount = async (req, res) => {
  try {
    const { companyId, branchId } = req.body;
    console.log(`Received params - companyId: ${companyId}, branchId: ${branchId}`);

    const connectionPool = await connectionPoolWithRetry();
    console.log('Connected to MySQL database.');

    connectionPool.query(
      queries.getAllCustomersCount,
      [companyId, branchId],
      (error, results) => {
        if (error) {
          console.error('Error fetching customer count:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        console.log('Query executed successfully.');
        console.log('Raw results:', results);

        if (!results || results.length === 0) {
          console.warn('No customers found for the given parameters.');
          return res.status(404).json({ message: 'No customers found' });
        }

        // ✅ Extract the correct column from the result
        const totalCustomers = results[0].customerCount || 0;
        console.log(`Total customers fetched: ${totalCustomers}`);

        res.status(200).json({
          message: 'Customers count fetched successfully',
          totalCustomers: results
        });
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
