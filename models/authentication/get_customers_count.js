const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getCustomersCount = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();

    const {companyId, branchId} = req.body;
    connectionPool.query(queries.getAllCustomersCount, [companyId, branchId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Customers not found' });
      }

      res.status(200).json({ message: 'Customers fetched successfully', customers: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getCustomersCount,
};
