const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const getPermissions = async (req, res) => {
  try {
    const connectionPool = await connectionPoolWithRetry();

    const roleId = req.body.id;
    connectionPool.query(queries.getPermissions, [roleId], async (error, results) => {
      if (error) {
        console.error('Error fetching content:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'Permissions not found' });
      }
      const permissionsWithSubmenus = [];

      for (const permission of results) {
        const submenu = await fetchSubmenu(connectionPool, permission.menuId);
        permission.submenu = submenu;
        permissionsWithSubmenus.push(permission);
      }

      res.status(200).json({ message: 'Permissions fetched successfully', contents: permissionsWithSubmenus });
    });
  } catch (err) {
    console.error('Error initializing connection:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const fetchSubmenu = (connectionPool, menuId) => {
  return new Promise((resolve, reject) => {
    connectionPool.query(queries.getSubmenu, [menuId], (error, results) => {
      if (error) {
        console.error('Error fetching submenu:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  getPermissions,
};
