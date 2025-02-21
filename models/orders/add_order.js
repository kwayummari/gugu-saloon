const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const xss = require('xss');

// Validator functions for each field
const validateOrderFields = [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('phone').notEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Invalid phone number').trim().escape(),
    body('hairStyleId').isInt().withMessage('Hair style ID must be an integer').toInt(),
    body('hairDresserId').isInt().withMessage('Hair dresser ID must be an integer').toInt(),
    body('randomNumber').isNumeric().withMessage('Random number must be numeric').trim(),
    body('companyId').isInt().withMessage('Company ID must be an integer').toInt(),
    body('branchId').isInt().withMessage('Branch ID must be an integer').toInt(),
    body('managerId').isInt().withMessage('Manager ID must be an integer').toInt()
];

const registerOrder = async (req, res) => {
    try {
        // Validate request body fields
        const errors = validationResult(req);

        // If there are validation errors, return a 400 response with the first error message
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, phone, hairStyleId, hairDresserId, randomNumber, companyId, branchId, managerId } = req.body;

        // Sanitize the input to prevent XSS attacks
        const sanitizedName = xss(name);
        const sanitizedPhone = xss(phone);

        const connectionPool = await connectionPoolWithRetry();

        // Get current date and time
        const now = new Date();
        const hours = now.getHours();

        // If the time is between 00:00 and 07:59, subtract one day
        if (hours >= 0 && hours < 8) {
            now.setDate(now.getDate() - 1);
        }

        // Format date as YYYY-MM-DD
        const orderDate = now.toISOString().split('T')[0];
        console.log("Order Date:", orderDate);
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

            // Insert order using add_order_with_date query
            connectionPool.query(
                queries.add_order_with_date, // Using the new query to include the order date
                [sanitizedName, sanitizedPhone, hairStyleId, hairDresserId, randomNumber, managerStatus, companyId, branchId, orderDate],
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
    validateOrderFields,
    registerOrder
};
