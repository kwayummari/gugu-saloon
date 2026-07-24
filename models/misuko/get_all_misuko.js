const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getMisuko = async (req, res) => {
  try {
    const {companyId, branchId} = req.body;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.getHairStyles, [companyId, branchId], (error, results) => {
      if (error) {
        console.error('Error fetching hair style:', error);
        return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
      }

      if (results.length === 0) {
        return res.status(200).json({ message: 'Hakuna mitindo ya nywele iliyopatikana', hairStyle: [] });
      }

      res.status(200).json({ message: 'Taarifa zimepatikana', hairStyle: results });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
  }
};

module.exports = {
  getMisuko,
};