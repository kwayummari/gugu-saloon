const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getOrdersByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const connectionPool = await connectionPoolWithRetry();
    
    connectionPool.query(queries.getOrdersByRange, 
      [startDate, endDate, startDate, endDate, startDate, endDate], 
      (error, results) => {
        if (error) {
          console.error('Error fetching hair style:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'No orders found' });
        }

        let overallTotalOfficeAmount = 0;
        const hairDresserDict = {};

        results.forEach(row => {
          // Capture overall total office amount
          if (overallTotalOfficeAmount === 0) {
            overallTotalOfficeAmount = row.overallTotalOfficeAmount;
          }

          // Initialize hairdresser entry if it does not exist
          if (!hairDresserDict[row.hairDresserName]) {
            hairDresserDict[row.hairDresserName] = {
              hairDresserName: row.hairDresserName,
              totalHairDresserAmount: row.totalHairDresserAmount,
              totalOfficeAmount: row.totalOfficeAmount,
              orders: [] // Updated to store orders with hairstyle name
            };
          }

          // Add order details along with hairstyle name
          hairDresserDict[row.hairDresserName].orders.push({
            name: row.orderName,
            date: row.orderDate,
            hairstyleName: row.hairstyleName // Include hairstyle name
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
  getOrdersByRange,
};
