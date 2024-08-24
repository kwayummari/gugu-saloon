const connectionPoolWithRetry = require('../../database/db_connection');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');

const validateExpenses = [
    body('valueHolder').trim().notEmpty().withMessage('Please select expense type'),
    body('amount').trim().notEmpty().withMessage('Please add amount')
];

const addExpenses = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }
        const { valueHolder, amount, branchId, companyId } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(
            queries.addExpenses,
            [ valueHolder, amount, branchId, companyId ],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                return res.status(200).json({ message: 'Expenses added successfully' });
            }
        );
    } catch (err) {
        console.error('Error creating branch:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    validateExpenses,
    addExpenses,
};
