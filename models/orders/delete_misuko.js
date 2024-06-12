const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const deleteMisuko = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const id = req.body.id;
        connectionPool.query(
            queries.check_hairStyle_existence_byId,
            [id],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length > 0) {
                    return res.status(400).json({ message: "Hair style can't be deleted some users are registered with it" });
                }
                connectionPool.query(queries.deleteMsuko, [id], (error, results) => {
                    if (error) {
                        console.error('Error deleting role:', error);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
        
                    res.status(200).json({ message: 'Hair style deleted successfully', user: results[0] });
                });
            }
        );
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    deleteMisuko,
};
