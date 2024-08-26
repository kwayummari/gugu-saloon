const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getOrders = async (req, res) => {
  try {
    const { companyId, branchId } = req.body;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getOrders, [companyId, branchId,companyId, branchId,companyId, branchId,companyId, branchId], (error, results) => {
      if (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'No orders were recorded today' });
      }
      let overallTotalOfficeAmount = 0;
      let overallTotalVishanga = 0;
      let overallTotalCostOfHair = 0;
      let overallTotalHairDresserAmount = 0;
      let overallTotalExpenses = 0;
      let actualTotalProfit = 0;
      const hairDresserDict = {};

      results.forEach(row => {
        if (overallTotalOfficeAmount === 0) {
          overallTotalOfficeAmount = row.overallTotalOfficeAmount;
          overallTotalVishanga = row.overallTotalVishanga;
          overallTotalCostOfHair = row.overallTotalCostOfHair;
          overallTotalHairDresserAmount = row.overallTotalHairDresserAmount;
          overallTotalExpenses = row.overallTotalExpenses;
          actualTotalProfit = row.actualTotalProfit;
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
          date: row.orderDate,
          hairstyleName: row.hairstyleName,
          description: row.description,
          costOfHair: row.costOfHair,
          vishanga: row.vishanga,
          hairDresserAmount: row.HairDresserAmount,
          officeAmount: row.officeAmount,
          receiptNumber: row.receiptNumber
        });
      });

      const orders = Object.values(hairDresserDict);
      res.status(200).json({
        message: 'Orders fetched successfully',
        overallTotalOfficeAmount: overallTotalOfficeAmount,
        overallTotalVishanga: overallTotalVishanga,
        overallTotalCostOfHair: overallTotalCostOfHair,
        overallTotalHairDresserAmount: overallTotalHairDresserAmount,
        overallTotalExpenses: overallTotalExpenses,
        actualTotalProfit: actualTotalProfit,
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
