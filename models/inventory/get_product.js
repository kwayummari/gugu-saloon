const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getProducts = async (req, res) => {
  try {
    const companyId = req.body.companyId;
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(queries.get_products, [companyId], async (error, productResults) => {
      if (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
      }

      if (productResults.length === 0) {
        return res.status(200).json({ message: 'Huna bidhaa zilizopo', products: [] });
      }
      const productWithBranch = await Promise.all(productResults.map(async product => {
        return new Promise((resolve, reject) => {
          connectionPool.query(queries.getBranchById, [product.branchId], (error, branchResults) => {
            if (error) {
              console.error('Error fetching branch:', error);
              reject(error);
            } else {
              const branch = branchResults[0];
              if (branch) {
                product.branch = `${branch.name}`;
              } else {
                product.branch = "Tawi halikupatikana";
              }
              resolve(product);
            }
          });
        });
      }));

      res.status(200).json({ message: 'Taarifa za bidhaa zimepatikana', products: productWithBranch });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
  }
};

module.exports = {
  getProducts,
};
