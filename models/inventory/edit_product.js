const connectionPoolWithRetry = require('../../database/db_connection');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');

const validateEditProduct = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 })
        .withMessage('Name must be at most 50 characters').isLength({ min: 3 })
        .withMessage('Name must be at least 4 characters'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 500 })
        .withMessage('Description must be at most 500 characters').isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),
    body('quantity').trim().notEmpty().withMessage('Quantity is required'),
    body('buyingPrice').trim().notEmpty().withMessage('Buying Price is required'),
    body('sellingPrice').trim().notEmpty().withMessage('Selling Price is required'),
];

const edit_product = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }
        const { name, description, quantity, buyingPrice, sellingPrice, branchId, companyId, userId, id } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(
            queries.check_inventory_existence,
            [name, branchId, companyId],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length = 0) {
                    return res.status(400).json({ message: "Product doesn't exists" });
                }
                connectionPool.query(
                    queries.edit_product,
                    [name, description, quantity, buyingPrice, sellingPrice, branchId, companyId, userId, id],
                    (error, result) => {
                        if (error) {
                            return res.status(500).json({ message: error.message });
                        }
                        return res.status(200).json({ message: 'Product edited successfully', result});
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
    validateEditProduct,
    edit_product,
};
