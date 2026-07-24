const connectionPoolWithRetry = require('../../database/db_connection');
const { body, validationResult } = require('express-validator');
const queries = require('../../database/queries');
const util = require('util');
const { getActiveShift } = require('../../services/shiftService');
const { sendSMS } = require('../../services/smsService');
const { getAdminPhone } = require('../settings/admin_settings');

const validateExpenses = [
    body('valueHolder').trim().notEmpty().withMessage('Tafadhali chagua aina ya matumizi'),
    body('amount').trim().notEmpty().withMessage('Tafadhali weka kiasi').isFloat({ gt: 0 }).withMessage('Kiasi lazima kiwe namba chanya'),
    body('description').optional({ checkFalsy: true }).trim(),
    body('managerId').isInt().withMessage('Hitilafu ya taarifa za meneja').toInt(),
    body('branchId').isInt().withMessage('Hitilafu ya taarifa za tawi').toInt(),
    body('companyId').isInt().withMessage('Hitilafu ya taarifa za kampuni').toInt()
];

const addExpenses = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { valueHolder, amount, companyId, branchId, managerId } = req.body;
    const description = req.body.description || null;
    let connection;

    try {
        connection = await connectionPoolWithRetry();
        const queryAsync = util.promisify(connection.query).bind(connection);

        // Get current date (adjust if between 00:00 - 07:59)
        const now = new Date();
        if (now.getHours() < 8) {
            now.setDate(now.getDate() - 1);
        }
        const expenseDate = now.toISOString().split('T')[0];

        console.log("Expense Date:", expenseDate);

        // Check for active shift - PREVENT EXPENSES WITHOUT ACTIVE SHIFT
        const shiftCheck = await getActiveShift(branchId);
        if (!shiftCheck.success || !shiftCheck.shift) {
            return res.status(403).json({
                message: 'Hakuna zamu iliyoanzishwa. Meneja anatakiwa aanzishe zamu kabla ya kuweka matumizi.',
                requiresShift: true
            });
        }

        const activeShiftId = shiftCheck.shift.id;
        console.log(`💰 Expense will be linked to shift ID: ${activeShiftId}`);

        // Get manager details
        const managerResult = await queryAsync('SELECT fullname FROM user WHERE id = ?', [managerId]);
        const managerName = managerResult && managerResult.length > 0 ? managerResult[0].fullname : 'Unknown Manager';

        // Get branch name
        const branchResult = await queryAsync('SELECT name FROM branch WHERE id = ?', [branchId]);
        const branchName = branchResult && branchResult.length > 0 ? branchResult[0].name : 'Unknown Branch';

        // Get expense type name
        const expenseTypeResult = await queryAsync('SELECT name FROM expenses_type WHERE id = ?', [valueHolder]);
        const expenseTypeName = expenseTypeResult && expenseTypeResult.length > 0 ? expenseTypeResult[0].name : 'Unknown';

        // Get today's expenses BEFORE adding new expense (for previous balance)
        const todayExpensesQuery = `
            SELECT 
                COUNT(*) as expenseCount,
                SUM(amount) as totalExpenses
            FROM expenses
            WHERE date = ? AND companyId = ? AND branchId = ?
        `;
        const previousExpensesResult = await queryAsync(todayExpensesQuery, [expenseDate, companyId, branchId]);
        const previousExpenseCount = previousExpensesResult && previousExpensesResult.length > 0 ? (previousExpensesResult[0].expenseCount || 0) : 0;
        const previousTotalExpenses = previousExpensesResult && previousExpensesResult.length > 0 ? (previousExpensesResult[0].totalExpenses || 0) : 0;

        // Calculate new expense totals
        const newExpenseCount = previousExpenseCount + 1;
        const newTotalExpenses = previousTotalExpenses + parseFloat(amount);

        // Get today's orders (revenue and office amount)
        const todayOrdersQuery = `
            SELECT 
                COUNT(*) as orderCount,
                SUM(hs.amount) as totalRevenue,
                SUM(hs.officeAmount) as totalOfficeAmount,
                SUM(hs.hairDresserAmount) as totalHairdresserAmount
            FROM orders o
            JOIN hairStyle hs ON o.hairStyleId = hs.id
            WHERE o.date = ? AND o.companyId = ? AND o.branchId = ?
        `;
        const ordersResult = await queryAsync(todayOrdersQuery, [expenseDate, companyId, branchId]);
        const todayOrderCount = ordersResult && ordersResult.length > 0 ? (ordersResult[0].orderCount || 0) : 0;
        const todayTotalRevenue = ordersResult && ordersResult.length > 0 ? (ordersResult[0].totalRevenue || 0) : 0;
        const todayTotalOfficeAmount = ordersResult && ordersResult.length > 0 ? (ordersResult[0].totalOfficeAmount || 0) : 0;
        const todayTotalHairdresserAmount = ordersResult && ordersResult.length > 0 ? (ordersResult[0].totalHairdresserAmount || 0) : 0;

        // Insert expense into database with shift_id
        await queryAsync(queries.addExpensesWithShift, [
            valueHolder, amount, description, companyId, branchId, expenseDate, activeShiftId
        ]);

        // Format amounts with thousands separator
        const formattedAmount = parseFloat(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formattedPreviousTotal = previousTotalExpenses.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formattedNewTotal = newTotalExpenses.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formattedOrderRevenue = todayTotalRevenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formattedOfficeAmount = todayTotalOfficeAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formattedHairdresserAmount = todayTotalHairdresserAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Calculate correct net profit (office amount - expenses)
        const netProfit = todayTotalOfficeAmount - newTotalExpenses;
        const formattedNetProfit = netProfit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Get current time
        const expenseTime = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Build expense notification message with proper breakdown
        const balanceUpdate = `\n\nEXPENSES:\nPrevious: ${previousExpenseCount} (${formattedPreviousTotal} Tsh)\nCurrent: ${newExpenseCount} (${formattedNewTotal} Tsh)\n\nORDERS TODAY:\nCount: ${todayOrderCount}\nRevenue: ${formattedOrderRevenue} Tsh\nOffice Amount: ${formattedOfficeAmount} Tsh\nHairdresser Amount: ${formattedHairdresserAmount} Tsh\n\nNET PROFIT: ${formattedNetProfit} Tsh\n(Office Amount - Expenses)`;

        const smsMessage = `NEW EXPENSE ALERT\n\nType: ${expenseTypeName}\nAmount: ${formattedAmount} Tsh\nDescription: ${description || 'N/A'}\nBranch: ${branchName}\nCreated by: ${managerName}\nTime: ${expenseTime}${balanceUpdate}\n\n- Gugu Beauty Saloon`;

        // Send SMS to admin (async, don't wait)
        getAdminPhone()
            .then((adminPhone) => sendSMS(adminPhone, smsMessage))
            .then((smsResult) => {
                if (smsResult.success) {
                    console.log('✅ Admin notified of new expense via SMS');
                } else {
                    console.error('❌ Failed to send expense SMS:', smsResult.error);
                }
            })
            .catch((err) => {
                console.error('❌ Expense SMS notification error:', err.message);
            });

        return res.status(200).json({ message: 'Matumizi yamewekwa kikamilifu' });

    } catch (err) {
        console.error('Error adding expense:', err);
        return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
    }
};

module.exports = {
    validateExpenses,
    addExpenses
};
