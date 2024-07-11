const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getOrdersByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getOrdersByRange, [startDate, endDate, startDate, endDate], (error, results) => {
      if (error) {
        console.error('Error fetching hair style:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No orders found' });
      }

      res.status(200).json({ message: 'Orders fetched successfully', orders: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
    getOrdersByRange,
};