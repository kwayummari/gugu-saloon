const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getSupplier = async (req, res) => {
  try {
    const companyId = req.body.companyId;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getSupplier, [companyId], async(error, results) => {
      if (error) {
        console.error('Error fetching suppliers:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(200).json({ message: 'No suppliers found', suppliers: results });
      }

      res.status(200).json({ message: 'Supplier fetched successfully', suppliers: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
    getSupplier,
};