const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const xss = require('xss');

const validateEditingUser = [
    body('fullname').trim().notEmpty().withMessage('Fullname is required').isLength({ max: 50 })
        .withMessage('Fullname must be at most 50 characters').isLength({ min: 4 })
        .withMessage('Fullname must be at least 15 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required')
        .isLength({ max: 10 }).withMessage('Gender must be at most 10 characters')
        .isLength({ min: 4 }).withMessage('Phone number must be at least 15 characters')
        .if(body('phone_number').exists()).isString().withMessage('Phone number must be a string')
        .if(body('phone_number').isString()).isLength({ max: 10 }).withMessage('Phone number must be at most 10 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('branch').trim().notEmpty().withMessage('Branch is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

const editUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }
        const { fullname, phone, email, branch, role, password, id } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const connectionPool = await connectionPoolWithRetry();
        connectionPool.query(
            queries.edit_user,
            [fullname, phone, email, branch, role, hashedPassword, id],
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }
                return res.status(200).json({ message: 'User edited successfully', userId: result.insertId });
            }
        );
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    validateEditingUser,
    editUser,
};
