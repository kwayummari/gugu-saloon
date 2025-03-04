const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getOrders = async (req, res) => {
  const { companyId, branchId, orderStatus, startDate, endDate } = req.body;

  console.log(`Received params - companyId: ${companyId}, branchId: ${branchId}, orderStatus: ${orderStatus}, startDate: ${startDate}, endDate: ${endDate}`);

  // Validate startDate and endDate
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required.' });
  }

  try {
    const connectionPool = await connectionPoolWithRetry();

    // Prepare the query parameters
    const queryParams = [
      companyId,
      branchId,
      orderStatus,
      startDate, // Start date for the SQL query
      endDate,   // End date for the SQL query
      companyId,
      branchId,
      orderStatus,
      startDate, // Start date for HairDresserAggregates
      endDate,   // End date for HairDresserAggregates
      companyId,
      branchId,
      orderStatus,
      startDate, // Start date for TotalOfficeAmount
      endDate,   // End date for TotalOfficeAmount
      companyId,
      branchId,
      startDate, // Start date for TotalExpenses
      endDate    // End date for TotalExpenses
    ];

    // Execute the query
    connectionPool.query(queries.getOrders, queryParams, (error, results) => {
      if (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'No orders were recorded in the given date range' });
      }

      let overallTotalOfficeAmount = 0;
      let overallTotalVishanga = 0;
      let overallTotalCostOfHair = 0;
      let overallTotalHairDresserAmount = 0;
      let overallTotalExpenses = 0;
      let actualTotalProfit = 0;
      let overallTotalAmountPaid = 0;
      const hairDresserDict = {};

      results.forEach(row => {
        // Initialize overall totals
        if (overallTotalOfficeAmount === 0) {
          overallTotalOfficeAmount = row.overallTotalOfficeAmount;
          overallTotalVishanga = row.overallTotalVishanga;
          overallTotalCostOfHair = row.overallTotalCostOfHair;
          overallTotalHairDresserAmount = row.overallTotalHairDresserAmount;
          overallTotalExpenses = row.overallTotalExpenses;
          actualTotalProfit = row.actualTotalProfit;
          overallTotalAmountPaid = row.overallTotalAmountPaid;
        }

        // Populate hairdresser details
        if (!hairDresserDict[row.hairDresserName]) {
          hairDresserDict[row.hairDresserName] = {
            hairDresserName: row.hairDresserName,
            totalHairDresserAmount: row.totalHairDresserAmount,
            totalOfficeAmount: row.totalOfficeAmount,
            overallTotalAmountPaid: row.overallTotalAmountPaid,
            orderNames: [],
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
          receiptNumber: row.receiptNumber,
        });
      });

      const orders = Object.values(hairDresserDict);
      res.status(200).json({
        message: 'Orders fetched successfully',
        overallTotalOfficeAmount,
        overallTotalVishanga,
        overallTotalCostOfHair,
        overallTotalHairDresserAmount,
        overallTotalExpenses,
        actualTotalProfit,
        overallTotalAmountPaid,
        orders,
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