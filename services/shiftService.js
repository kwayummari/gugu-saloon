const connectionPoolWithRetry = require('../database/db_connection');
const queries = require('../database/queries');
const { sendSMS } = require('./smsService');
const { getAdminPhone } = require('../models/settings/admin_settings');

/**
 * Determine shift type from the manager account starting the shift.
 * Each account is fixed to 'day' or 'night' (user.shift_type), so the
 * shift it opens is always tagged the same way regardless of clock time.
 */
const determineShiftType = async (managerId) => {
    const connectionPool = await connectionPoolWithRetry();

    const user = await new Promise((resolve, reject) => {
        connectionPool.query(queries.getUserShiftType, [managerId], (error, results) => {
            if (error) reject(error);
            else resolve(results[0]);
        });
    });

    return user?.shift_type || 'day';
};

/**
 * Get or create active shift for a manager
 */
const getOrCreateShift = async (branchId, managerId, managerName) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        // Check if this manager already has an active shift at this branch.
        // Scoped per manager so a day account and a night account can each
        // have their own concurrently-active shift on the same branch.
        const activeShift = await new Promise((resolve, reject) => {
            connectionPool.query(queries.getActiveShiftForManager, [branchId, managerId], (error, results) => {
                if (error) reject(error);
                else resolve(results[0] || null);
            });
        });

        // If active shift exists, return it
        if (activeShift) {
            return {
                success: true,
                shift: activeShift,
                isNew: false
            };
        }

        // Create new shift
        const shiftType = await determineShiftType(managerId);
        const startTime = new Date();

        const newShiftId = await new Promise((resolve, reject) => {
            connectionPool.query(
                queries.createShift,
                [branchId, managerId, managerName, shiftType, startTime],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result.insertId);
                }
            );
        });

        const newShift = await new Promise((resolve, reject) => {
            connectionPool.query(queries.getShiftById, [newShiftId], (error, results) => {
                if (error) reject(error);
                else resolve(results[0]);
            });
        });

        console.log(`✅ New ${shiftType} shift started for ${managerName} at branch ${branchId}`);

        return {
            success: true,
            shift: newShift,
            isNew: true
        };

    } catch (error) {
        console.error('❌ Error in getOrCreateShift:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * End shift and calculate totals
 */
const endShift = async (shiftId) => {
    try {
        const connectionPool = await connectionPoolWithRetry();
        
        // Get shift details
        const shift = await new Promise((resolve, reject) => {
            connectionPool.query(queries.getShiftById, [shiftId], (error, results) => {
                if (error) reject(error);
                else resolve(results[0]);
            });
        });

        if (!shift) {
            return { success: false, message: 'Shift not found' };
        }

        if (shift.status === 'ended') {
            return { success: false, message: 'Shift already ended' };
        }

        // Get shift statistics
        const stats = await new Promise((resolve, reject) => {
            connectionPool.query(queries.getShiftStatistics, [shiftId], (error, results) => {
                if (error) reject(error);
                else resolve(results[0]);
            });
        });

        // Get shift expenses
        const expensesResult = await new Promise((resolve, reject) => {
            connectionPool.query(queries.getShiftExpenses, [shiftId], (error, results) => {
                if (error) reject(error);
                else resolve(results[0]);
            });
        });

        const totalExpenses = parseFloat(expensesResult.totalExpenses || 0);
        const netProfit = parseFloat(stats.totalOfficeAmount || 0) - totalExpenses;

        const endTime = new Date();

        // Update shift with totals
        await new Promise((resolve, reject) => {
            connectionPool.query(
                queries.endShift,
                [
                    endTime,
                    stats.orderCount,
                    stats.totalRevenue,
                    stats.totalHairDresserAmount,
                    stats.totalOfficeAmount,
                    stats.totalCostOfHair,
                    stats.totalVishanga,
                    totalExpenses,
                    netProfit,
                    shiftId
                ],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        // Calculate shift duration
        const duration = Math.round((endTime - new Date(shift.start_time)) / (1000 * 60)); // minutes
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        // Format amounts
        const formatAmount = (amount) => parseFloat(amount || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Send SMS notification
        const shiftEndTime = endTime.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const smsMessage = `SHIFT ENDED - ${shift.shift_type.toUpperCase()}\n\nManager: ${shift.manager_name}\nDuration: ${hours}h ${minutes}m\nEnded: ${shiftEndTime}\n\nSUMMARY:\nOrders: ${stats.orderCount}\nRevenue: ${formatAmount(stats.totalRevenue)} Tsh\nHairdressers: ${formatAmount(stats.totalHairDresserAmount)} Tsh\nOffice: ${formatAmount(stats.totalOfficeAmount)} Tsh\nExpenses: ${formatAmount(totalExpenses)} Tsh\nNet Profit: ${formatAmount(netProfit)} Tsh\n\n- Gugu Beauty Saloon`;

        getAdminPhone()
            .then((adminPhone) => sendSMS(adminPhone, smsMessage))
            .then((result) => {
                if (result.success) {
                    console.log('✅ Shift end notification sent via SMS');
                } else {
                    console.error('❌ Failed to send shift end SMS:', result.error);
                }
            })
            .catch((err) => {
                console.error('❌ Shift SMS notification error:', err.message);
            });

        console.log(`✅ Shift ${shiftId} ended successfully. Net Profit: ${formatAmount(netProfit)} Tsh`);

        return {
            success: true,
            shiftSummary: {
                shiftId,
                shiftType: shift.shift_type,
                managerName: shift.manager_name,
                startTime: shift.start_time,
                endTime,
                duration: `${hours}h ${minutes}m`,
                totalOrders: stats.orderCount,
                totalRevenue: stats.totalRevenue,
                totalHairDresserAmount: stats.totalHairDresserAmount,
                totalOfficeAmount: stats.totalOfficeAmount,
                totalCostOfHair: stats.totalCostOfHair,
                totalVishanga: stats.totalVishanga,
                totalExpenses,
                netProfit
            }
        };

    } catch (error) {
        console.error('❌ Error ending shift:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get active shift for a branch
 */
const getActiveShift = async (branchId) => {
    try {
        const connectionPool = await connectionPoolWithRetry();
        
        const activeShift = await new Promise((resolve, reject) => {
            connectionPool.query(queries.getActiveShift, [branchId], (error, results) => {
                if (error) reject(error);
                else resolve(results[0] || null);
            });
        });

        return {
            success: true,
            shift: activeShift
        };
    } catch (error) {
        console.error('❌ Error getting active shift:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get active shift for a specific manager at a branch
 */
const getActiveShiftForManager = async (branchId, managerId) => {
    try {
        const connectionPool = await connectionPoolWithRetry();

        const activeShift = await new Promise((resolve, reject) => {
            connectionPool.query(queries.getActiveShiftForManager, [branchId, managerId], (error, results) => {
                if (error) reject(error);
                else resolve(results[0] || null);
            });
        });

        return {
            success: true,
            shift: activeShift
        };
    } catch (error) {
        console.error('❌ Error getting active shift for manager:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    getOrCreateShift,
    endShift,
    getActiveShift,
    getActiveShiftForManager,
    determineShiftType
};

