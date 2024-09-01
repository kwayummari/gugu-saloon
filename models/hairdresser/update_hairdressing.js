const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

const updateHairDressing = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const { id, status } = req.body;
        console.log(id, status)
        connectionPool.query(
            queries.update_hairdressing,
            [ status, id ],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length = 0) {
                    return res.status(400).json({ message: "Hair dresser not available" });
                }
                res.status(200).json({ message: status === '1' ? 'Hair dresser enabled successfully' : 'Hair dresser disabled successfully' });
            }
        );
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    updateHairDressing,
};
