const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const payroll = async (req, res) => {
  try {
    const { companyId, branchId, date } = req.body;

    let queryDate = date;
    if (!queryDate) {
      // No explicit date requested - default to "today" with the 8am cutoff logic
      const now = new Date();
      const hours = now.getHours();
      if (hours >= 0 && hours < 8) {
        now.setDate(now.getDate() - 1);
      }
      queryDate = now.toISOString().split('T')[0];
    }
    console.log('📅 Payroll Date:', queryDate);

    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getPayroll, [companyId, branchId, queryDate], (error, results) => {
      if (error) {
        console.error('Error fetching payroll:', error);
        return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
      }

      if (results.length === 0) {
        console.log('⚠️ No payroll data found for date:', queryDate);
        return res.status(200).json({ message: 'Hakuna taarifa za malipo zilizopatikana' });
      }

      console.log('✅ Payroll fetched:', results.length, 'hairdressers');
      res.status(200).json({ message: 'Taarifa za malipo zimepatikana', payroll: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
  }
};

module.exports = {
  payroll,
};