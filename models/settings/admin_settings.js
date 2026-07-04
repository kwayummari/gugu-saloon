const connectionPoolWithRetry = require('../../database/db_connection');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');

const validateAdminSettings = [
    body('adminPhone')
        .trim()
        .notEmpty().withMessage('Admin phone number is required')
        .matches(/^[0-9+]{9,15}$/).withMessage('Enter a valid phone number'),
];

const getAdminSettings = async (req, res) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(queries.getAdminSettings, (error, results) => {
            if (error) {
                console.error('Error fetching admin settings:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            return res.status(200).json({
                message: 'Admin settings fetched successfully',
                adminPhone: results[0]?.admin_phone || '',
            });
        });
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updateAdminSettings = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }

        const { adminPhone } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(queries.upsertAdminSettings, [adminPhone], (error) => {
            if (error) {
                console.error('Error updating admin settings:', error);
                return res.status(500).json({ message: error.message });
            }

            return res.status(200).json({ message: 'Admin settings updated successfully' });
        });
    } catch (err) {
        console.error('Error updating admin settings:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Internal helper for backend services (SMS notifications) to resolve the
 * admin phone number. Falls back to the ADMIN_PHONE env var if the DB has
 * no value yet, so notifications never silently stop working.
 */
const getAdminPhone = async () => {
    try {
        const connectionPool = await connectionPoolWithRetry();
        return await new Promise((resolve) => {
            connectionPool.query(queries.getAdminSettings, (error, results) => {
                if (error) {
                    console.error('Error resolving admin phone:', error);
                    return resolve(process.env.ADMIN_PHONE || '0762996305');
                }
                resolve(results[0]?.admin_phone || process.env.ADMIN_PHONE || '0762996305');
            });
        });
    } catch (err) {
        console.error('Error resolving admin phone:', err);
        return process.env.ADMIN_PHONE || '0762996305';
    }
};

module.exports = {
    validateAdminSettings,
    getAdminSettings,
    updateAdminSettings,
    getAdminPhone,
};
