const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getBranch = async (req, res) => {
  try {
    const companyId = req.body.companyId;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getBranch, [companyId], async(error, results) => {
      if (error) {
        console.error('Error fetching branch:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No branches found' });
      }

      res.status(200).json({ message: 'Branches fetched successfully', branch: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
    getBranch,
};