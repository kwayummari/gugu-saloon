const connectionPoolWithRetry = require('../../database/db_connection');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');

const validateHairdresser = [
    body('name').trim().notEmpty().withMessage('Name is required'),
];

const registerHairDresser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(400).json({ message: firstError.msg });
        }

        const { name, branch, companyId } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(
            queries.check_hairdresser_existence,
            [name, branch, companyId],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }

                if (result.length > 0) {
                    return res.status(400).json({ message: 'Hair dresser already exists' });
                }

                // Register hairdresser
                connectionPool.query(
                    queries.register_hairdresser,
                    [name, branch, companyId],
                    (error, result) => {
                        if (error) {
                            return res.status(500).json({ message: error.message });
                        }

                        const hairdresserId = result.insertId;  // Get the last inserted ID

                        // Fetch all hairStyle IDs
                        connectionPool.query(queries.get_all_hairstyle_ids, [], (error, hairStyles) => {
                            if (error) {
                                return res.status(500).json({ message: error.message });
                            }

                            if (hairStyles.length === 0) {
                                return res.status(404).json({ message: 'No hairstyles found' });
                            }

                            // Create bulk insert values for hairDressing table
                            const values = hairStyles.map((style) => [style.id, hairdresserId]); // Assuming 'active' as default status
                            
                            connectionPool.query(
                                queries.bulk_register_hairdressing,
                                [values],
                                (error, result) => {
                                    if (error) {
                                        return res.status(500).json({ message: error.message });
                                    }
                                    return res.status(200).json({ message: 'Hairdresser and hairdressing entries created successfully', result });
                                }
                            );
                        });
                    }
                );
            }
        );
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    validateHairdresser,
    registerHairDresser,
};
