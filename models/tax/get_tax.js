const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getTax = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getTax, async(error, results) => {
      if (error) {
        console.error('Error fetching branch:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No Tax Type found' });
      }

      res.status(200).json({ message: 'Tax Type fetched successfully', tax: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getTax,
};