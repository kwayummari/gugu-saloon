const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getAllExpenses = async (req, res) => {
  try {
    const {companyId, branchId} = req.body;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getAllExpenses, [companyId, branchId], async(error, results) => {
      if (error) {
        console.error('Error fetching expenses:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'No expenses found' });
      }

      res.status(200).json({ message: 'Expenses fetched successfully', data: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
    getAllExpenses,
};