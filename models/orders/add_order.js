const connectionPoolWithRetry = require('../../database/db_connection');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const xss = require('xss');
const { sendSMS, sendOrderConfirmation } = require('../../services/smsService');
const { getActiveShift } = require('../../services/shiftService');
const { getAdminPhone } = require('../settings/admin_settings');

const DEFAULT_SMS_ALERT_TEMPLATE = `NEW ORDER ALERT

Receipt: {receipt}
Customer: {customer}
Service: {service}
Amount: {amount} Tsh
Hairdresser: {hairdresser}
Branch: {branchName}
Time: {time}

TODAY'S TOTALS:
Orders: {orderCount}
Revenue: {revenue} Tsh
Office Amount: {office} Tsh
Hairdresser Amount: {hairdresserAmount} Tsh
Expenses: {expenses} Tsh

NET PROFIT: {netProfit} Tsh

- Gugu Beauty Saloon`;

const renderTemplate = (template, data) =>
    template.replace(/{(\w+)}/g, (match, key) => (Object.prototype.hasOwnProperty.call(data, key) ? data[key] : match));

// Validator functions for each field
const validateOrderFields = [
    body('name').notEmpty().withMessage('Tafadhali weka jina la mteja').trim().escape(),
    body('phone').notEmpty().withMessage('Tafadhali weka namba ya simu').isMobilePhone().withMessage('Namba ya simu si sahihi').trim().escape(),
    body('hairStyleId').isInt().withMessage('Chagua mtindo wa nywele sahihi').toInt(),
    body('hairDresserId').isInt().withMessage('Chagua mtaalamu wa nywele sahihi').toInt(),
    body('randomNumber').isNumeric().withMessage('Namba ya risiti lazima iwe namba').trim(),
    body('companyId').isInt().withMessage('Hitilafu ya taarifa za kampuni').toInt(),
    body('branchId').isInt().withMessage('Hitilafu ya taarifa za tawi').toInt(),
    body('managerId').isInt().withMessage('Hitilafu ya taarifa za meneja').toInt()
];

const registerOrder = async (req, res) => {
    try {
        // Validate request body fields
        const errors = validationResult(req);

        // If there are validation errors, return a 400 response with the first error message
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, phone, hairStyleId, hairDresserId, randomNumber, companyId, branchId, managerId } = req.body;

        // Sanitize the input to prevent XSS attacks
        const sanitizedName = xss(name);
        const sanitizedPhone = xss(phone);

        // Check for active shift - PREVENT ORDERS WITHOUT ACTIVE SHIFT
        const shiftCheck = await getActiveShift(branchId);
        if (!shiftCheck.success || !shiftCheck.shift) {
            return res.status(403).json({
                message: 'Hakuna zamu iliyoanzishwa. Meneja anatakiwa aanzishe zamu kabla ya kuweka oda.',
                requiresShift: true
            });
        }

        const activeShiftId = shiftCheck.shift.id;
        console.log(`📦 Order will be linked to shift ID: ${activeShiftId}`);

        const connectionPool = await connectionPoolWithRetry();

        // Get current date and time
        const now = new Date();
        const hours = now.getHours();

        // If the time is between 00:00 and 07:59, subtract one day
        if (hours >= 0 && hours < 8) {
            now.setDate(now.getDate() - 1);
        }

        // Format date as YYYY-MM-DD
        const orderDate = now.toISOString().split('T')[0];
        const orderTime = now.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        console.log("Order Date:", orderDate);

        // Get hairstyle and hairdresser details for SMS
        connectionPool.query('SELECT name FROM hairStyle WHERE id = ?', [hairStyleId], (error, hairStyleResult) => {
            if (error) {
                console.error('Error fetching hairstyle:', error);
            }

            connectionPool.query('SELECT name FROM hairdresser WHERE id = ?', [hairDresserId], (error, hairdresserResult) => {
                if (error) {
                    console.error('Error fetching hairdresser:', error);
                }

                const hairStyleName = hairStyleResult && hairStyleResult.length > 0 ? hairStyleResult[0].name : 'Unknown';
                const hairdresserName = hairdresserResult && hairdresserResult.length > 0 ? hairdresserResult[0].name : 'Unknown';

                // Get branch name + SMS alert settings
                connectionPool.query(queries.getBranchSmsAlertSettings, [branchId], (error, branchResult) => {
                    if (error) {
                        console.error('Error fetching branch:', error);
                    }

                    const branchRow = branchResult && branchResult.length > 0 ? branchResult[0] : null;
                    const branchName = branchRow ? branchRow.name : 'Unknown Branch';
                    const smsAlertIntervalMinutes = branchRow ? branchRow.sms_alert_interval_minutes : 60;
                    const smsAlertTemplate = branchRow ? branchRow.sms_alert_template : null;
                    const smsAlertLastSentAt = branchRow ? branchRow.sms_alert_last_sent_at : null;

                    // Get hairstyle amount for this order
                    connectionPool.query('SELECT amount FROM hairStyle WHERE id = ?', [hairStyleId], (error, amountResult) => {
                        if (error) {
                            console.error('Error fetching hairstyle amount:', error);
                        }

                        const orderAmount = amountResult && amountResult.length > 0 ? amountResult[0].amount : 0;

                        // Get today's statistics BEFORE adding the order (for previous balance)
                        const todayStatsQuery = `
                        SELECT 
                            COUNT(*) as orderCount,
                            SUM(hs.amount) as totalAmount,
                            SUM(hs.officeAmount) as totalOfficeAmount,
                            SUM(hs.hairDresserAmount) as totalHairdresserAmount
                        FROM orders o
                        JOIN hairStyle hs ON o.hairStyleId = hs.id
                        WHERE o.date = ? AND o.companyId = ? AND o.branchId = ?
                    `;

                        connectionPool.query(todayStatsQuery, [orderDate, companyId, branchId], (error, previousStatsResult) => {
                            const previousOrderCount = previousStatsResult && previousStatsResult.length > 0 ? (previousStatsResult[0].orderCount || 0) : 0;
                            const previousTotalAmount = parseFloat(previousStatsResult && previousStatsResult.length > 0 ? (previousStatsResult[0].totalAmount || 0) : 0);
                            const previousTotalOfficeAmount = parseFloat(previousStatsResult && previousStatsResult.length > 0 ? (previousStatsResult[0].totalOfficeAmount || 0) : 0);
                            const previousTotalHairdresserAmount = parseFloat(previousStatsResult && previousStatsResult.length > 0 ? (previousStatsResult[0].totalHairdresserAmount || 0) : 0);

                            // Get this order's breakdown
                            connectionPool.query('SELECT officeAmount, hairDresserAmount FROM hairStyle WHERE id = ?', [hairStyleId], (error, styleBreakdown) => {
                                const thisOrderOfficeAmount = parseFloat(styleBreakdown && styleBreakdown.length > 0 ? styleBreakdown[0].officeAmount : 0);
                                const thisOrderHairdresserAmount = parseFloat(styleBreakdown && styleBreakdown.length > 0 ? styleBreakdown[0].hairDresserAmount : 0);

                                // Calculate new totals (ensure all are numbers)
                                const newOrderCount = previousOrderCount + 1;
                                const newTotalAmount = previousTotalAmount + parseFloat(orderAmount);
                                const newTotalOfficeAmount = previousTotalOfficeAmount + thisOrderOfficeAmount;
                                const newTotalHairdresserAmount = previousTotalHairdresserAmount + thisOrderHairdresserAmount;

                                console.log('📊 Order Calculation Debug:');
                                console.log('Previous Amount:', previousTotalAmount, 'Order Amount:', parseFloat(orderAmount), 'New Total:', newTotalAmount);
                                console.log('Previous Office:', previousTotalOfficeAmount, 'This Office:', thisOrderOfficeAmount, 'New Office:', newTotalOfficeAmount);
                                console.log('Previous Hairdresser:', previousTotalHairdresserAmount, 'This Hairdresser:', thisOrderHairdresserAmount, 'New Hairdresser:', newTotalHairdresserAmount);

                                // Insert order using add_order_with_shift query
                                const orderParams = [sanitizedName, sanitizedPhone, hairStyleId, hairDresserId, randomNumber, companyId, branchId, orderDate, activeShiftId];
                                console.log('Order params:', orderParams);
                                console.log('Active shift ID:', activeShiftId);

                                // Get today's expenses
                                connectionPool.query(
                                    'SELECT SUM(amount) as totalExpenses FROM expenses WHERE date = ? AND companyId = ? AND branchId = ?',
                                    [orderDate, companyId, branchId],
                                    (error, expensesResult) => {
                                        const todayTotalExpenses = parseFloat(expensesResult && expensesResult.length > 0 ? (expensesResult[0].totalExpenses || 0) : 0);

                                        connectionPool.query(
                                            queries.add_order_with_shift,
                                            orderParams,
                                            (error, result) => {
                                                if (error) {
                                                    console.log(error);
                                                    return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
                                                }

                                                // Helper function to format numbers safely
                                                const formatAmount = (value) => {
                                                    const num = parseFloat(value) || 0;
                                                    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                                };

                                                // Format amounts with thousands separator
                                                const formattedOrderAmount = formatAmount(orderAmount);
                                                const formattedPreviousAmount = formatAmount(previousTotalAmount);
                                                const formattedNewAmount = formatAmount(newTotalAmount);
                                                const formattedPreviousOffice = formatAmount(previousTotalOfficeAmount);
                                                const formattedNewOffice = formatAmount(newTotalOfficeAmount);
                                                const formattedPreviousHairdresser = formatAmount(previousTotalHairdresserAmount);
                                                const formattedNewHairdresser = formatAmount(newTotalHairdresserAmount);
                                                const formattedExpenses = formatAmount(todayTotalExpenses);

                                                // Calculate net profit (office amount - expenses)
                                                const netProfit = newTotalOfficeAmount - todayTotalExpenses;
                                                const formattedNetProfit = formatAmount(netProfit);

                                                // Decide whether the admin order-alert SMS is due (per-branch throttle)
                                                const minutesSinceLastSent = smsAlertLastSentAt
                                                    ? (Date.now() - new Date(smsAlertLastSentAt).getTime()) / 60000
                                                    : null;
                                                const alertIsDue = minutesSinceLastSent === null || minutesSinceLastSent >= smsAlertIntervalMinutes;

                                                if (alertIsDue) {
                                                    const templateData = {
                                                        receipt: randomNumber,
                                                        customer: sanitizedName,
                                                        phone: sanitizedPhone,
                                                        service: hairStyleName,
                                                        amount: formattedOrderAmount,
                                                        hairdresser: hairdresserName,
                                                        branchName: branchName,
                                                        time: orderTime,
                                                        orderCount: newOrderCount,
                                                        revenue: formattedNewAmount,
                                                        office: formattedNewOffice,
                                                        hairdresserAmount: formattedNewHairdresser,
                                                        expenses: formattedExpenses,
                                                        netProfit: formattedNetProfit,
                                                    };
                                                    const smsMessage = renderTemplate(
                                                        smsAlertTemplate || DEFAULT_SMS_ALERT_TEMPLATE,
                                                        templateData
                                                    );

                                                    // Send SMS to admin (async, don't wait)
                                                    getAdminPhone()
                                                        .then((adminPhone) => sendSMS(adminPhone, smsMessage))
                                                        .then((smsResult) => {
                                                            if (smsResult.success) {
                                                                console.log('✅ Admin notified of new order via SMS');
                                                                connectionPool.query(
                                                                    queries.updateBranchSmsAlertLastSent,
                                                                    [new Date(), branchId],
                                                                    () => {}
                                                                );
                                                            } else {
                                                                console.error('❌ Failed to send admin SMS:', smsResult.error);
                                                            }
                                                        })
                                                        .catch((err) => {
                                                            console.error('❌ Admin SMS notification error:', err.message);
                                                        });
                                                } else {
                                                    console.log(`⏱️ Admin order-alert SMS throttled for branch ${branchId} — next eligible in ${(smsAlertIntervalMinutes - minutesSinceLastSent).toFixed(1)} min`);
                                                }

                                                // Send SMS confirmation to customer
                                                sendOrderConfirmation(
                                                    sanitizedPhone,
                                                    sanitizedName,
                                                    hairStyleName,
                                                    hairdresserName,
                                                    randomNumber,
                                                    orderAmount
                                                )
                                                    .then((customerSmsResult) => {
                                                        if (customerSmsResult.success) {
                                                            console.log('✅ Customer notified of order via SMS:', sanitizedPhone);
                                                        } else {
                                                            console.error('❌ Failed to send customer SMS:', customerSmsResult.error);
                                                        }
                                                    })
                                                    .catch((err) => {
                                                        console.error('❌ Customer SMS notification error:', err.message);
                                                    });

                                                return res.status(200).json({ message: 'Oda imewekwa kikamilifu', order: result });
                                            }
                                        );
                                    }
                                );
                            });
                        });
                    });
                });
            });
        });

    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
    }
};

module.exports = {
    validateOrderFields,
    registerOrder
};
