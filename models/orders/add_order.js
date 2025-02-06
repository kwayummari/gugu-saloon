const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const xss = require('xss');

const validateOrder = [
    body('name').trim().notEmpty().withMessage('Name is required')
        .isLength({ max: 50 }).withMessage('Name must be at most 50 characters')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

    body('phone').trim().notEmpty().withMessage('Phone number is required')
        .isLength({ max: 10 }).withMessage('Phone must be at most 10 characters')
        .isLength({ min: 4 }).withMessage('Phone number must be at least 4 characters')
        .isString().withMessage('Phone number must be a string'),

    body('hairStyleId').trim().notEmpty().withMessage('Hair style is required'),
    body('hairDresserId').trim().notEmpty().withMessage('Hair dresser is required'),
    body('randomNumber').trim().notEmpty().withMessage('Receipt Number is required'),
    body('managerId').trim().notEmpty().withMessage('Manager is required'),
];

const registerOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, phone, hairStyleId, hairDresserId, randomNumber, companyId, branchId, managerId } = req.body;

        const connectionPool = await connectionPoolWithRetry();

        // First, get the manager status
        connectionPool.query(queries.getStatus, [managerId], (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: error.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'Manager not found' });
            }

            const managerStatus = result[0].status;

            // Insert order with retrieved manager status
            connectionPool.query(
                queries.add_order,
                [name, phone, hairStyleId, hairDresserId, randomNumber, managerStatus, companyId, branchId],
                (error, result) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ message: error.message });
                    }
                    return res.status(200).json({ message: 'Order created successfully', order: result });
                }
            );
        });

    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    validateOrder,
    registerOrder,
};
