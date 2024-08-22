const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const deleteBranch = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const id = req.body.id;
        connectionPool.query(
            queries.check_branch_user_existence,
            [id],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length > 0) {
                    return res.status(400).json({ message: "Branch can't be deleted some users are registered with it" });
                }
                connectionPool.query(queries.deleteBranch, [id], (error, results) => {
                    if (error) {
                        console.error('Error deleting branch:', error);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
        
                    res.status(200).json({ message: 'Branch deleted successfully', user: results[0] });
                });
            }
        );
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    deleteBranch,
};
