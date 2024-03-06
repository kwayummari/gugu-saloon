const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const deleteUsersById = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const id = req.body.id;
        connectionPool.query(queries.deleteUser, [id], (error, results) => {
            if (error) {
                console.error('Error deleting user account:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            res.status(200).json({ message: 'User deleted successfully', user: results[0] });
        });
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    deleteUsersById,
};
