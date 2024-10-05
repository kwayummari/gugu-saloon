const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const payroll = async (req, res) => {
  try {
    const {companyId, branchId} = req.body;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getPayroll, [companyId, branchId], (error, results) => {
      if (error) {
        console.error('Error fetching payroll:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No Payroll found' });
      }

      res.status(200).json({ message: 'Payroll fetched successfully', payroll: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  payroll,
};