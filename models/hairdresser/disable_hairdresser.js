const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const disableHairdressing = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const {id, value} = req.body;
        connectionPool.query(
            queries.check_hairdressing_existence,
            [id],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length = 0) {
                    return res.status(400).
                    json({ message: "Disabled not available" });
                }
                connectionPool.query(queries.disable_Hairdressing, [value,id], (error, results) => {
                    if (error) {
                        console.error('Error deleting hair dresser:', error);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
        
                    res.status(200).json({ message: 'Disabled successfully', user: results[0] });
                });
            }
        );
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    disableHairdressing,
};
