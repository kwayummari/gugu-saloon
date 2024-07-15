const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');

const validateLoginHairDresser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const loginHairDresser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(300).json({ message: firstError.msg });
    }
    const { name, password } = req.body;
    console.log(name)
    console.log(password)
    const connectionPool = await connectionPoolWithRetry();
    connectionPool.query(
      queries.loginHairDresser,
      [name],
      async (error, results) => {
        if (error) {
          return res.status(500).json({ message: error.message });
        }

        if (results.length === 0) {
          return res.status(400).json({ message: 'User not found' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password.trim(), user.password);

        if (!passwordMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', user: user });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  validateLoginHairDresser,
  loginHairDresser,
};
