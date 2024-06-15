const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const deleteHairDresser = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const id = req.body.id;
        connectionPool.query(
            queries.check_delete_hairdresser_existence,
            [id],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length = 0) {
                    return res.status(400).json({ message: "Hair dresser not available" });
                }
                connectionPool.query(queries.delete_Hairdresser, [id], (error, results) => {
                    if (error) {
                        console.error('Error deleting hair dresser:', error);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
        
                    res.status(200).json({ message: 'Hair dresser deleted successfully', user: results[0] });
                });
            }
        );
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    deleteHairDresser,
};
