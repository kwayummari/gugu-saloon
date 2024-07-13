const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getOrders = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();
    
    connectionPool.query(queries.getOrders, [], (error, results) => {
      if (error) {
        console.error('Error fetching hair style:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No orders were recorded today' });
      }

      // Transform the results into the desired JSON structure
      let overallTotalOfficeAmount = 0;
      const hairDresserDict = {};

      results.forEach(row => {
        if (overallTotalOfficeAmount === 0) {
          overallTotalOfficeAmount = row.overallTotalOfficeAmount;
        }

        if (!hairDresserDict[row.hairDresserName]) {
          hairDresserDict[row.hairDresserName] = {
            hairDresserName: row.hairDresserName,
            totalHairDresserAmount: row.totalHairDresserAmount,
            totalOfficeAmount: row.totalOfficeAmount,
            orderNames: []
          };
        }

        hairDresserDict[row.hairDresserName].orderNames.push({
          name: row.orderName,
          date: row.orderDate
        });
      });

      const orders = Object.values(hairDresserDict);

      res.status(200).json({
        message: 'Orders fetched successfully',
        overallTotalOfficeAmount: overallTotalOfficeAmount,
        orders: orders
      });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getOrders,
};
