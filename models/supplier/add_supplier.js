const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const xss = require('xss');

const validateSupplier = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 })
        .withMessage('Name must be at most 50 characters').isLength({ min: 3 })
        .withMessage('Name must be at least 4 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required')
        .isLength({ max: 10 }).withMessage('Gender must be at most 10 characters')
        .isLength({ min: 4 }).withMessage('Phone number must be at least 15 characters')
        .if(body('phone_number').exists()).isString().withMessage('Phone number must be a string')
        .if(body('phone_number').isString()).isLength({ max: 10 }).withMessage('Phone number must be at most 10 characters'),
    body('tin').trim().notEmpty().withMessage('Tin number is required').isLength({ max: 20 })
        .withMessage('Tin number must be at most 20 characters').isLength({ min: 20 })
        .withMessage('Tin number must be at least 20 characters'),
    body('location').trim().notEmpty().withMessage('Location is required').isLength({ max: 50 })
        .withMessage('Location must be at most 50 characters').isLength({ min: 3 })
        .withMessage('Location must be at least 4 characters'),
];

const registerSupplier = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }
        const { name, phone, tin, location, branch, companyId } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(
            queries.check_supplier_existence,
            [name, companyId],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length > 0) {
                    return res.status(400).json({ message: 'Supplier already exists' });
                }
                connectionPool.query(
                    queries.register_supplier,
                    [name, phone, tin, location, branch, companyId],
                    (error, result) => {
                        if (error) {
                            return res.status(500).json({ message: error.message });
                        }

                        return res.status(200).json({ message: 'Supplier registered successfully' });
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
    validateSupplier,
    registerSupplier,
};
