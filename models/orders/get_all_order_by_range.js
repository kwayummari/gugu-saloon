const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getOrdersByRange = async (req, res) => {
  try {
    const { startDate, endDate, companyId, branchId } = req.body;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getOrdersByRange,
      [companyId, branchId, startDate, endDate, companyId, branchId, startDate, endDate, companyId, branchId, startDate, endDate, companyId, branchId, startDate, endDate],
      (error, results) => {
        if (error) {
          console.error('Error fetching hair style:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'No orders found' });
        }
        let overallTotalOfficeAmount = 0;
        let overallTotalVishanga = 0;
        let overallTotalCostOfHair = 0;
        let overallTotalHairDresserAmount = 0;
        let actualExpenses = 0;
        const hairDresserDict = {};
        results.forEach(row => {
          if (overallTotalOfficeAmount === 0) {
            overallTotalOfficeAmount = row.overallTotalOfficeAmount;
            overallTotalVishanga = row.overallTotalVishanga;
            overallTotalCostOfHair = row.overallTotalCostOfHair;
            overallTotalHairDresserAmount = row.overallTotalHairDresserAmount;
            actualExpenses = row.actualExpenses;
          }
          if (!hairDresserDict[row.hairDresserName]) {
            hairDresserDict[row.hairDresserName] = {
              hairDresserName: row.hairDresserName,
              totalHairDresserAmount: row.totalHairDresserAmount,
              totalOfficeAmount: row.totalOfficeAmount,
              orders: []
            };
          }
          hairDresserDict[row.hairDresserName].orders.push({
            name: row.orderName,
            date: row.orderDate,
            receiptNumber: row.receiptNumber,
            description: row.description,
            costOfHair: row.costOfHair,
            vishanga: row.vishanga,
            hairDresserAmount: row.hairDresserAmount,
            officeAmount: row.officeAmount
          });
        });
        const orders = Object.values(hairDresserDict);
        res.status(200).json({
          message: 'Orders fetched successfully',
          overallTotalOfficeAmount: overallTotalOfficeAmount,
          overallTotalVishanga: overallTotalVishanga,
          overallTotalCostOfHair: overallTotalCostOfHair,
          overallTotalHairDresserAmount: overallTotalHairDresserAmount,
          actualExpenses: actualExpenses,
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
