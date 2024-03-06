const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');

const validateEditingPassword = [
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

const editPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }
        const { password, id } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const connectionPool = await connectionPoolWithRetry();
        
        connectionPool.query(
            queries.check_user_existence_by_id,
            [id],
            (error, result) => {
              if (error) {
                return res.status(500).json({ message: error.message });
              }
              if (result.length > 0) {
                return res.status(400).json({ message: 'User already exists' });
              }
              connectionPool.query(
                queries.edit_user_password,
                [ hashedPassword, id],
                (error, result) => {
                    if (error) {
                        return res.status(500).json({ message: error.message });
                    }
                    return res.status(200).json({ message: 'User Password edited successfully' });
                }
            );
            }
          );
        } catch (err) {
          console.error('Error editing password:', err);
          res.status(500).json({ message: 'Server Error' });
        }
};


module.exports = {
    validateEditingPassword,
    editPassword,
};
