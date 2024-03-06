const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const xss = require('xss');

const validateHairdresser = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 })
        .withMessage('Name must be at most 50 characters').isLength({ min: 3 })
        .withMessage('Name must be at least 4 characters'),
];

const registerHairDresser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }
        const { name, companyId } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(
            queries.check_hairdresser_existence,
            [name, companyId],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length > 0) {
                    return res.status(400).json({ message: 'Hair dresser already exists' });
                }
                connectionPool.query(
                    queries.register_role,
                    [name, companyId],
                    (error, result) => {
                        if (error) {
                            return res.status(500).json({ message: error.message });
                        }
                        return res.status(200).json({ message: 'Hair dresser created successfully', result });
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
