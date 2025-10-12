const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const xss = require('xss');
const { generateToken } = require('../../middleware/auth');
const { sendLoginNotification } = require('../../services/smsService');
const { getOrCreateShift } = require('../../services/shiftService');

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email or phone is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(300).json({ message: firstError.msg });
    }
    const { email, password } = req.body;
    const sanitizedEmail = xss(email);
    const connectionPool = await connectionPoolWithRetry();
    // Search by email OR phone
    connectionPool.query(
      queries.login,
      [sanitizedEmail, sanitizedEmail], // Search both fields with same value
      async (error, results) => {
        if (error) {
          console.log(error)
          return res.status(500).json({ message: error.message });
        }

        if (results.length === 0) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password.trim(), user.password);

        if (!passwordMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Remove password from response for security
        const { password: userPassword, ...userWithoutPassword } = user;

        // Generate JWT token
        const token = generateToken({
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          branch: user.branch
        });

        // Get login metadata
        const loginTime = new Date();
        const formattedTime = loginTime.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
        const userAgent = req.get('user-agent') || 'Unknown';

        // Log login to database (async, don't wait)
        connectionPool.query(
          queries.insertLoginHistory,
          [
            user.id,
            user.fullname,
            'user',
            loginTime,
            ipAddress,
            userAgent,
            'success',
            0,
            null
          ],
          (logError) => {
            if (logError) {
              console.error('❌ Error logging login history:', logError.message);
            } else {
              console.log('✅ Login history saved for:', user.fullname);
            }
          }
        );

        // Send SMS notification (async, don't wait)
        sendLoginNotification(user.fullname, formattedTime, 'user')
          .then((smsResult) => {
            if (smsResult.success) {
              console.log('✅ Admin notified via SMS');
              connectionPool.query(
                'UPDATE login_history SET sms_sent = 1, sms_status = ? WHERE user_id = ? AND login_time = ? ORDER BY id DESC LIMIT 1',
                ['sent', user.id, loginTime],
                () => {}
              );
            } else {
              console.error('❌ Failed to send SMS:', smsResult.error);
            }
          })
          .catch((err) => {
            console.error('❌ SMS notification error:', err.message);
          });

        // Auto-start shift (async, don't wait)
        getOrCreateShift(user.branch, user.id, user.fullname)
          .then((shiftResult) => {
            if (shiftResult.success && shiftResult.isNew) {
              console.log(`✅ ${shiftResult.shift.shift_type} shift auto-started for ${user.fullname}`);
            }
          })
          .catch((err) => {
            console.error('❌ Shift creation error:', err.message);
          });

        res.status(200).json({
          message: 'Login successful',
          token,
          user: userWithoutPassword
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  validateLogin,
  loginUser,
};
