const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getOrdersByRange = async (req, res) => {
  try {
    const { startDate, endDate, companyId, branchId, orderStatus } = req.body;
    console.log(req.body);

    // Using the promise API from mysql2
    const connectionPool = await connectionPoolWithRetry();

    // Replace the callback query with promise-based query
    const [results] = await connectionPool.promise().query(
      queries.getOrdersByRange,
      [
        companyId, branchId, orderStatus, startDate, endDate,
        companyId, branchId, orderStatus, startDate, endDate,
        companyId, branchId, orderStatus, startDate, endDate,
        companyId, branchId, orderStatus, startDate, endDate
      ]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    let overallTotalOfficeAmount = 0;
    let overallTotalVishanga = 0;
    let overallTotalCostOfHair = 0;
    let overallTotalHairDresserAmount = 0;
    let actualExpenses = 0;
    let overallTotalAmountPaid = 0;
    const hairDresserDict = {};

    results.forEach(row => {
      if (overallTotalOfficeAmount === 0) {
        overallTotalOfficeAmount = row.overallTotalOfficeAmount;
        overallTotalVishanga = row.overallTotalVishanga;
        overallTotalCostOfHair = row.overallTotalCostOfHair;
        overallTotalHairDresserAmount = row.overallTotalHairDresserAmount;
        actualExpenses = row.actualExpenses;
        overallTotalAmountPaid = row.overallTotalAmountPaid;
      }
      if (!hairDresserDict[row.hairDresserName]) {
        hairDresserDict[row.hairDresserName] = {
          hairDresserName: row.hairDresserName,
          totalHairDresserAmount: row.totalHairDresserAmount,
          totalOfficeAmount: row.totalOfficeAmount,
          overallTotalAmountPaid: row.overallTotalAmountPaid,
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
      overallTotalAmountPaid: overallTotalAmountPaid,
      actualExpenses: actualExpenses,
      orders: orders
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getOrdersByRange,
};
     