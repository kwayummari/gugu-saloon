const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getUserById = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();

    const { id } = req.body;
    connectionPool.query(queries.getUserById, [id], (error, results) => {
      if (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Mtumiaji hakupatikana' });
      }

      res.status(200).json({ message: 'Taarifa za mtumiaji zimepatikana', user: results[0] });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
  }
};

module.exports = {
  getUserById,
};
