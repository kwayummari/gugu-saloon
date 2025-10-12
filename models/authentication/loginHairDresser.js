const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const { generateToken } = require('../../middleware/auth');
const { sendLoginNotification } = require('../../services/smsService');

const validateLoginHairDresser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Email, phone, or username is required'),
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
    const connectionPool = await connectionPoolWithRetry();

    // Search by name, email, or phone
    connectionPool.query(
      queries.loginHairDresser,
      [name, name, name], // Search all three fields with same value
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

        // Remove password from response for security
        const { password: userPassword, ...userWithoutPassword } = user;

        // Generate JWT token
        const token = generateToken({
          id: user.id,
          name: user.name,
          branchId: user.branchId,
          companyId: user.companyId,
          type: 'hairdresser'
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

        // Log login to database (don't wait for it)
        connectionPool.query(
          queries.insertLoginHistory,
          [
            user.id,
            user.name,
            'hairdresser',
            loginTime,
            ipAddress,
            userAgent,
            'success',
            0, // SMS not sent yet
            null
          ],
          (logError, logResult) => {
            if (logError) {
              console.error('❌ Error logging login history:', logError.message);
            } else {
              console.log('✅ Login history saved for:', user.name);
            }
          }
        );

        // Send SMS notification to admin (async, don't wait)
        sendLoginNotification(user.name, formattedTime, 'hairdresser')
          .then((smsResult) => {
            if (smsResult.success) {
              console.log('✅ Admin notified via SMS');
              // Update SMS status in login history
              connectionPool.query(
                'UPDATE login_history SET sms_sent = 1, sms_status = ? WHERE user_id = ? AND login_time = ? ORDER BY id DESC LIMIT 1',
                ['sent', user.id, loginTime],
                (updateError) => {
                  if (updateError) {
                    console.error('❌ Error updating SMS status:', updateError.message);
                  }
                }
              );
            } else {
              console.error('❌ Failed to send SMS:', smsResult.error);
              // Update SMS status as failed
              connectionPool.query(
                'UPDATE login_history SET sms_sent = 0, sms_status = ? WHERE user_id = ? AND login_time = ? ORDER BY id DESC LIMIT 1',
                ['failed: ' + smsResult.error, user.id, loginTime],
                () => { }
              );
            }
          })
          .catch((err) => {
            console.error('❌ SMS notification error:', err.message);
          });

        // Return success response immediately
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
  validateLoginHairDresser,
  loginHairDresser,
};
