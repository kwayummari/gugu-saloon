const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getHairDressersById = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();
    const styleId = req.body.styleId;
    console.log(styleId)
    connectionPool.query(queries.getHairDresserById, [styleId], async (error, hairDresserResults) => {
      if (error) {
        console.error('Error fetching hair dresser:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (hairDresserResults.length === 0) {
        return res.status(404).json({ message: 'No hair dresser found' });
      }

      res.status(200).json({ message: 'Hair fetched successfully', hairDresser: hairDresserResults });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getHairDressersById,
};
