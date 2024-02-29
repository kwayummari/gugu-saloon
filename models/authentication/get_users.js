const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getAllUsers = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();

    connectionPool.query(queries.getAllUsers, (error, results) => {
      if (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }

      res.status(200).json({ message: 'Users fetched successfully', users: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAllUsers,
};