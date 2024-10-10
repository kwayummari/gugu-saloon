const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const reconciliation = async (req, res) => {
  try {
    const {companyId, branchId} = req.body;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.performReconciliation, [companyId, branchId], (error) => {
      if (error) {
        console.error('Error performing reconciliation:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      res.status(200).json({ message: 'Reconciliation done successfully' });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  reconciliation,
};