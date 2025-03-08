const connectionPoolWithRetry = require('../../database/db_connection');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const util = require('util');

const validateExpenses = [
    body('valueHolder').trim().notEmpty().withMessage('Please select expense type'),
    body('amount').trim().notEmpty().withMessage('Please add amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('description').trim().notEmpty().withMessage('Please add description'),
    body('managerId').isInt().withMessage('Manager ID must be an integer').toInt(),
    body('branchId').isInt().withMessage('Branch ID must be an integer').toInt(),
    body('companyId').isInt().withMessage('Company ID must be an integer').toInt()
];

const addExpenses = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { valueHolder, amount,companyId, branchId,  description, managerId } = req.body;
    let connection;

    try {
        connection = await connectionPoolWithRetry();
        const queryAsync = util.promisify(connection.query).bind(connection);

        // Get current date (adjust if between 00:00 - 07:59)
        const now = new Date();
        if (now.getHours() < 8) {
            now.setDate(now.getDate() - 1);
        }
        const expenseDate = now.toISOString().split('T')[0];

        console.log("Expense Date:", expenseDate);

        // Get manager status
        const managerResult = await queryAsync(queries.getStatus, [managerId]);
        if (managerResult.length === 0) {
            return res.status(404).json({ message: 'Manager not found' });
        }
        const expenseStatus = managerResult[0].status;

        // Insert expense into database
        await queryAsync(queries.addExpenses, [
            valueHolder, amount, description,companyId, branchId,  expenseStatus, expenseDate
        ]);

        return res.status(200).json({ message: 'Expense added successfully' });

    } catch (err) {
        console.error('Error adding expense:', err);
        return res.status(500).json({ message: 'Server Error' });

    } finally {
        if (connection) {
            connection.end(); // Close the connection properly
        }
    }
};

module.exports = {
    validateExpenses,
    addExpenses
};
