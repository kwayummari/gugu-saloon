const connectionPoolWithRetry = require('../../database/db_connection');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');

const validateEditMsuko = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 })
        .withMessage('Name must be at most 50 characters').isLength({ min: 3 })
        .withMessage('Name must be at least 4 characters'),
    body('amount').trim().notEmpty().withMessage('Amount is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('officeAmount').trim().notEmpty().withMessage('Office Amount is required'),
    body('hairDresserAmount').trim().notEmpty().withMessage('Hair Dresser Amount is required'),
    body('costOfHair').trim().notEmpty().withMessage('Cost Of Hair is required'),
    body('vishanga').trim().notEmpty().withMessage('Vishanga is required'),
    body('remainderAmount').trim().notEmpty().withMessage('Remainder Amount is required'),
];

const editMsuko = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }
        const { name, amount, description, officeAmount, hairDresserAmount, costOfHair, vishanga, remainderAmount, id } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(
            queries.checkForHairStyle,
            [name, id],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length = 0) {
                    return res.status(400).json({ message: "Hair style doesn't exists" });
                }
                connectionPool.query(
                    queries.edit_Hairstyle,
                    [name, amount, description, officeAmount, hairDresserAmount, costOfHair, vishanga, remainderAmount, id],
                    (error, result) => {
                        if (error) {
                            return res.status(500).json({ message: error.message });
                        }
                        return res.status(200).json({ message: 'Hair style edited successfully'});
                    }
                );
            }
        );
    } catch (err) {
        console.error('Error editing role:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    validateEditMsuko,
    editMsuko,
};
