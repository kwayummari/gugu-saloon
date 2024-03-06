const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getProducts = async (req, res) => {
  try {
    const companyId = req.body.companyId;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.get_products, [companyId], async (error, productResults) => {
      if (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (productResults.length === 0) {
        return res.status(404).json({ message: 'You do not have products' });
      }
      const productWithBranch = await Promise.all(productResults.map(async product => {
        return new Promise((resolve, reject) => {
          connectionPool.query(queries.getBranchById, [product.branchId], (error, productResults) => {
            if (error) {
              console.error('Error fetching products:', error);
              reject(error);
            } else {
              product.branchId = productResults;
              resolve(product);
            }
          });
        });
      }));

      res.status(200).json({ message: 'Products fetched successfully', products: productWithBranch });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getProducts,
};
