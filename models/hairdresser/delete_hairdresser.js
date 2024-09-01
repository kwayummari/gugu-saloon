const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const deleteHairDresser = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();
        const id = req.body.id;
        connectionPool.beginTransaction(async (err) => {
            if (err) {
                return res.status(500).json({ message: 'Transaction error', error: err.message });
            }
            connectionPool.query(queries.check_delete_hairdresser_existence, [id], (error, result) => {
                if (error) {
                    return connectionPool.rollback(() => {
                        res.status(500).json({ message: 'Internal Server Error', error: error.message });
                    });
                }
                if (result.length === 0) {
                    return res.status(400).json({ message: "Hairdresser not available" });
                }
                connectionPool.query(queries.delete_hairdressing, [id], (error, results) => {
                    if (error) {
                        return connectionPool.rollback(() => {
                            console.error('Error deleting from hairDressing:', error);
                            res.status(500).json({ message: 'Internal Server Error' });
                        });
                    }
                    connectionPool.query(queries.delete_Hairdresser, [id], (error, results) => {
                        if (error) {
                            return connectionPool.rollback(() => {
                                console.error('Error deleting hairdresser:', error);
                                res.status(500).json({ message: 'Internal Server Error' });
                            });
                        }
                        connectionPool.commit((err) => {
                            if (err) {
                                return connectionPool.rollback(() => {
                                    res.status(500).json({ message: 'Transaction commit error', error: err.message });
                                });
                            }
                            res.status(200).json({ message: 'Hairdresser and associated hairdressing entries deleted successfully' });
                        });
                    });
                });
            });
        });
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
module.exports = {
    deleteHairDresser,
};
