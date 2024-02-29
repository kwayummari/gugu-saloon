const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const deleteUsersById = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const id = req.body.id;
        connectionPool.query(queries.delete, [id], (error, results) => {
            if (error) {
                console.error('Error fetching user:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
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