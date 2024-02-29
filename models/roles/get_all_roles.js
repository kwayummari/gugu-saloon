const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getRoles = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();

    connectionPool.query(queries.getRoles, (error, results) => {
      if (error) {
        console.error('Error fetching branch:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No roles found' });
      }

      res.status(200).json({ message: 'Roles fetched successfully', roles: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
    getRoles,
};