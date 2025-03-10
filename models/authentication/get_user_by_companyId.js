const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getUserByCompanyId = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();

    const companyId = req.body.companyId;
    connectionPool.query(queries.getAllUsersByCompany, [companyId], (error, results) => {
      if (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User fetched successfully', users: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getUserByCompanyId,
};
