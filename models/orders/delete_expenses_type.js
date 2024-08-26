const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const deleteExpenses = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const id = req.body.id;
                connectionPool.query(queries.delete_expenses_type, [id], (error, results) => {
                    if (error) {
                        console.error('Error deleting expenses type:', error);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
        
                    res.status(200).json({ message: 'Expenses type deleted successfully' });
                });
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    deleteExpenses,
};
