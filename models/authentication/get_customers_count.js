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

        // ✅ Ensure the response is an array containing the total customer count
        const totalCustomers = results.map(result => result.customerCount || 0); // Returning results as an array
        console.log(`Total customers fetched: ${totalCustomers}`);

        res.status(200).json({
          message: 'Customers count fetched successfully',
          totalCustomers: totalCustomers // Returning the count as an array
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
