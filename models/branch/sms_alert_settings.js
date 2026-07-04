const connectionPoolWithRetry = require('../../database/db_connection');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');

const validateSmsAlertSettings = [
    body('branchId').isInt().withMessage('Branch ID must be an integer'),
    body('intervalMinutes').isInt({ min: 1 }).withMessage('Interval must be a positive number of minutes'),
    body('template').trim().notEmpty().withMessage('Message template is required'),
];

const getSmsAlertSettings = async (req, res) => {
    try {
        const { branchId } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(queries.getBranchSmsAlertSettings, [branchId], (error, results) => {
            if (error) {
                console.error('Error fetching SMS alert settings:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Branch not found' });
            }

            const row = results[0];
            return res.status(200).json({
                message: 'SMS alert settings fetched successfully',
                branchName: row.name,
                intervalMinutes: row.sms_alert_interval_minutes,
                template: row.sms_alert_template,
                lastSentAt: row.sms_alert_last_sent_at,
            });
        });
    } catch (err) {
        console.error('Error initializing connection:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updateSmsAlertSettings = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            return res.status(300).json({ message: firstError.msg });
        }

        const { branchId, intervalMinutes, template } = req.body;
        const connectionPool = await connectionPoolWithRetry();

        connectionPool.query(
            queries.updateBranchSmsAlertSettings,
            [intervalMinutes, template, branchId],
            (error) => {
                if (error) {
                    console.error('Error updating SMS alert settings:', error);
                    return res.status(500).json({ message: error.message });
                }

                return res.status(200).json({ message: 'SMS alert settings updated successfully' });
            }
        );
    } catch (err) {
        console.error('Error updating SMS alert settings:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    validateSmsAlertSettings,
    getSmsAlertSettings,
    updateSmsAlertSettings,
};
