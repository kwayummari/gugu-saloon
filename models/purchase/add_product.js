const connectionPoolWithRetry = require('../../database/db_connection');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');

const validateProduct = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 })
        .withMessage('Name must be at most 50 characters').isLength({ min: 3 })
        .withMessage('Name must be at least 4 characters'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 500 })
        .withMessage('Description must be at most 500 characters').isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),
    body('quantity').trim().notEmpty().withMessage('Quantity is required'),
    body('buyingPrice').trim().notEmpty().withMessage('Buying Price is required'),
    body('sellingPrice').trim().notEmpty().withMessage('Selling Price is required'),
    body('productNumber').trim().notEmpty().withMessage('Product Number is required'),
    body('taxType').trim().notEmpty().withMessage('Tax Type is required'),
];

const registerProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }
        const { name, description, quantity, buyingPrice, sellingPrice,
            productNumber, taxType, branchId, companyId, userId } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(
            queries.check_product_existence,
            [name, branchId, companyId],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                if (result.length > 0) {
                    return res.status(400).json({ message: 'Product already exists' });
                }
                connectionPool.query(
                    queries.register_product,
                    [name, description, quantity, buyingPrice, sellingPrice, productNumber, taxType, branchId, companyId, userId],
                    (error, result) => {
                        if (error) {
                            return res.status(500).json({ message: error.message });
                        }
                        return res.status(200).json({ message: 'Product created successfully' });
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
    validateProduct,
    registerProduct,
};
