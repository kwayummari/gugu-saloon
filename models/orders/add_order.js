const registerOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, phone, hairStyleId, hairDresserId, randomNumber, companyId, branchId, managerId } = req.body;

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

        // First, get the manager status
        connectionPool.query(queries.getStatus, [managerId], (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: error.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'Manager not found' });
            }

            const managerStatus = result[0].status;

            // Insert order using add_order_with_date query
            connectionPool.query(
                queries.add_order_with_date, // Using the new query to include the order date
                [name, phone, hairStyleId, hairDresserId, randomNumber, managerStatus, companyId, branchId, orderDate],
                (error, result) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ message: error.message });
                    }
                    return res.status(200).json({ message: 'Order created successfully', order: result });
                }
            );
        });

    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerOrder
}