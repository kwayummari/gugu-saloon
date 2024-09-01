const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getHairDressers = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();
    const { companyId, branchId } = req.body;
    
    connectionPool.query(queries.getHairDresser, [companyId, branchId], async (error, hairDresserResults) => {
      if (error) {
        console.error('Error fetching hairdresser:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (hairDresserResults.length === 0) {
        return res.status(404).json({ message: 'No hairdresser found' });
      }

      // Fetch hairDressing details for each hairDresser
      const hairDressersWithHairDressing = await Promise.all(hairDresserResults.map(async (hairDresser) => {
        return new Promise((resolve, reject) => {
          connectionPool.query(
            queries.get_hairdressing2, 
            [hairDresser.id], 
            (error, hairDressingResults) => {
              if (error) {
                console.error(`Error fetching hairDressing for hairdresserId ${hairDresser.id}:`, error);
                reject({ message: 'Internal Server Error' });
              } else {
                resolve({
                  ...hairDresser,
                  hairDressing: hairDressingResults,
                });
              }
            }
          );
        });
      }));

      res.status(200).json({ message: 'Data fetched successfully', hairDressers: hairDressersWithHairDressing });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getHairDressers,
};
