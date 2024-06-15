const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const delete_hairdresser_hairstyling = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const id = req.body.id;
        connectionPool.query(
            queries.check_hairdressing_existence,
            [id],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length == 0) {
                    return res.status(400).json({ message: "Hair style can't be deleted at the moment" });
                }
                connectionPool.query(queries.delete_hairdresser_hairstyling_Hairdressing, [id], (error, results) => {
                    if (error) {
                        console.error('Error deleting role:', error);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
        
                    res.status(200).json({ message: 'Deleted successfully', user: results[0] });
                });
            }
        );
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    delete_hairdresser_hairstyling,
};
