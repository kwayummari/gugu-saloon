const { getActiveShift, endShift, getOrCreateShift } = require('../../services/shiftService');
const connectionPoolWithRetry = require('../../database/db_connection');
const queries = require('../../database/queries');

/**
 * Get active shift for a branch
 */
const getActive = async (req, res) => {
    try {
        const { branchId } = req.body;

        if (!branchId) {
            return res.status(400).json({ message: 'Branch ID is required' });
        }

        const result = await getActiveShift(branchId);

        if (!result.success) {
            return res.status(500).json({ message: result.error });
        }

        if (!result.shift) {
            return res.status(404).json({ 
                message: 'No active shift found',
                hasShift: false
            });
        }

        res.status(200).json({
            message: 'Active shift retrieved',
            shift: result.shift,
            hasShift: true
        });
    } catch (error) {
        console.error('Error getting active shift:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * End current shift
 */
const endCurrentShift = async (req, res) => {
    try {
        const { shiftId } = req.body;

        if (!shiftId) {
            return res.status(400).json({ message: 'Shift ID is required' });
        }

        const result = await endShift(shiftId);

        if (!result.success) {
            return res.status(400).json({ message: result.message || result.error });
        }

        res.status(200).json({
            message: 'Shift ended successfully',
            summary: result.shiftSummary
        });
    } catch (error) {
        console.error('Error ending shift:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Get shift summary/details
 */
const getShiftSummary = async (req, res) => {
    try {
        const { shiftId } = req.body;

        if (!shiftId) {
            return res.status(400).json({ message: 'Shift ID is required' });
        }

        const connectionPool = await connectionPoolWithRetry();

        // Get shift details
        connectionPool.query(queries.getShiftById, [shiftId], (error, shiftResult) => {
            if (error) {
                console.error('Error fetching shift:', error);
                return res.status(500).json({ message: error.message });
            }

            if (shiftResult.length === 0) {
                return res.status(404).json({ message: 'Shift not found' });
            }

            const shift = shiftResult[0];

            // Get shift orders
            connectionPool.query(queries.getCurrentShiftOrders, [shiftId], (error, orders) => {
                if (error) {
                    console.error('Error fetching shift orders:', error);
                    return res.status(500).json({ message: error.message });
                }

                res.status(200).json({
                    message: 'Shift summary retrieved',
                    shift: shift,
                    orders: orders || []
                });
            });
        });
    } catch (error) {
        console.error('Error getting shift summary:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Start new shift (manual)
 */
const startShift = async (req, res) => {
    try {
        const { branchId, managerId, managerName } = req.body;

        if (!branchId || !managerId || !managerName) {
            return res.status(400).json({ message: 'Tafadhali weka Tawi, Meneja na Jina la Meneja' });
        }

        const result = await getOrCreateShift(branchId, managerId, managerName);

        if (!result.success) {
            return res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
        }

        res.status(200).json({
            message: result.isNew ? 'Zamu mpya imeanzishwa' : 'Zamu tayari ipo',
            shift: result.shift,
            isNew: result.isNew
        });
    } catch (error) {
        console.error('Error starting shift:', error);
        res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
    }
};

module.exports = {
    getActive,
    endCurrentShift,
    getShiftSummary,
    startShift
};

