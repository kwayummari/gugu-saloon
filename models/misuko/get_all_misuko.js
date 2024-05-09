const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getMisuko = async (req, res) => {
  try {
    const companyId = req.body.companyId;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getHairStyles, [companyId], (error, results) => {
      if (error) {
        console.error('Error fetching hair style:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No hair styles found' });
      }

      res.status(200).json({ message: 'Hair style fetched successfully', hairStyle: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getMisuko,
};