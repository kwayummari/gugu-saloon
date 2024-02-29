const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const updatePermission = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();

    const permissions = req.body.permissions;
    const promises = permissions.map(permission => {
      return new Promise((resolve, reject) => {
        const query = `UPDATE permission SET ${permission.typeValue} = ? WHERE id = ?`;
        connectionPool.query(query, [permission.status, permission.id], (error, results) => {
          if (error) {
            console.error('Error updating permission:', error);
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    });

    Promise.all(promises)
      .then(results => {
        // Check if any permissions were updated
        if (results.some(result => result.affectedRows > 0)) {
          res.status(200).json({ message: 'Permissions updated successfully' });
        } else {
          res.status(404).json({ message: 'Permissions not updated' });
        }
      })
      .catch(error => {
        console.error('Error updating permissions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      });

  } catch (err) {
    console.error('Error initializing connection:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  updatePermission,
};
