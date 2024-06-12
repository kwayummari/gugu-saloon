const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getMisukoById = async (req, res) => {
  try {
    const id = req.body.id;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getHairstyleById, [id], async (error, misukoResults) => {
      if (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (misukoResults.length === 0) {
        return res.status(404).json({ message: 'You do not have roles' });
      }

      res.status(200).json({ message: 'Hair style fetched successfully', hairStyle: misukoResults });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getMisukoById,
};
