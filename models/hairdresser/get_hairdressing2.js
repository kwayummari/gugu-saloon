const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getHairDressing2 = async (req, res) => {
  try {
    const { editHairDresserId } = req.body;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.get_hairdressing2, [editHairDresserId], (error, results) => {
      if (error) {
        console.error('Error fetching branch:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No hairdressing found' });
      }
      res.status(200).json({ message: 'Hair dressing fetched successfully', hairDressing: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getHairDressing2,
};