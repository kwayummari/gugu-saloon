const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const reconciliation = async (req, res) => {
  try {
    const {companyId, branchId} = req.body;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.performReconciliation, [companyId, branchId], (error) => {
      if (error) {
        console.error('Error performing reconciliation:', error);
        return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
      }

      res.status(200).json({ message: 'Uhakiki umefanyika kikamilifu' });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
  }
};

module.exports = {
  reconciliation,
};