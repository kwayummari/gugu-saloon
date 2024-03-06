const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getPurchase = async (req, res) => {
  try {
    const companyId = req.body.companyId;
    const supplierId = req.body.supplierId;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.get_order, [companyId, supplierId, 0], async (error, orderResults) => {
      if (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (orderResults.length === 0) {
        return res.status(404).json({ message: 'You do not have orders' });
      }

      // Fetch branch details for each order
      for (let i = 0; i < orderResults.length; i++) {
        const order = orderResults[i];
        connectionPool.query(queries.get_branch, [companyId, order.branchId], (branchError, branchResults) => {
          if (branchError) {
            console.error('Error fetching branch details:', branchError);
            return res.status(500).json({ message: 'Internal Server Error' });
          }
          order.branchDetails = branchResults[0]; // Assuming only one branch matched
          
          // Fetch inventory details for each order
          connectionPool.query(queries.get_inventory, [order.inventoryId], (inventoryError, inventoryResults) => {
            if (inventoryError) {
              console.error('Error fetching inventory details:', inventoryError);
              return res.status(500).json({ message: 'Internal Server Error' });
            }
            order.inventoryDetails = inventoryResults[0]; // Assuming only one inventory matched

            // Check if all orders have been processed before sending response
            if (i === orderResults.length - 1) {
              res.status(200).json({ message: 'Orders fetched successfully', orders: orderResults });
            }
          });
        });
      }
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getPurchase,
};
