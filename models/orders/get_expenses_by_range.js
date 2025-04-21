const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getExpensesByRange = async (req, res) => {
  try {
    const { startDate, endDate, companyId, branchId, orderStatus } = req.body;

    console.log('📥 Incoming Request Body:', req.body);

    const connectionPool = await connectionPoolWithRetry();

    const params = [companyId, branchId, orderStatus, startDate, endDate];
    console.log('🧾 SQL Params:', params);
    console.log('🔍 SQL Query:\n', queries.getExpensesByRange);

    connectionPool.query(queries.getExpensesByRange, params, (error, results) => {
      if (error) {
        console.error(' Error executing query:', error.sqlMessage || error.message);
        console.error('🧾 Failed SQL Params:', params);
        return res.status(500).json({ message: 'Internal Server Error', error: error.sqlMessage });
      }

      console.log('✅ Query Result:', results);

      if (results.length === 0) {
        console.log('⚠️ No expenses found for given criteria.');
        return res.status(404).json({ message: 'No expenses found' });
      }

      res.status(200).json({
        message: 'Expenses fetched successfully',
        expenses: results
      });
    });
  } catch (err) {
    console.error('💥 Error initializing DB connection:', err.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getExpensesByRange,
};
