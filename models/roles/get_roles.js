const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getRoles = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();

    connectionPool.query(queries.getRoles, async (error, rolesResults) => {
      if (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (rolesResults.length === 0) {
        return res.status(404).json({ message: 'No roles found' });
      }

      // Fetch permissions for each role
      const rolesWithPermissions = await Promise.all(rolesResults.map(async role => {
        return new Promise((resolve, reject) => {
          connectionPool.query(queries.getPermissions, [role.id], (error, permissionsResults) => {
            if (error) {
              console.error('Error fetching permissions:', error);
              reject(error);
            } else {
              role.permissions = permissionsResults;
              resolve(role);
            }
          });
        });
      }));

      res.status(200).json({ message: 'Roles fetched successfully', roles: rolesWithPermissions });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getRoles,
};
