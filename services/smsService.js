const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BEEM_API_KEY = process.env.BEEM_API_KEY;
const BEEM_SECRET_KEY = process.env.BEEM_SECRET_KEY;
const BEEM_SENDER_ID = process.env.BEEM_SENDER_ID || 'GUGU';
const BEEM_API_URL = process.env.BEEM_API_URL || 'https://apisms.beem.africa/v1/send';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '0762996305';

/**
 * Send SMS via Beem Africa API
 * @param {string} phoneNumber - Recipient phone number (format: 255XXXXXXXXX or 0XXXXXXXXX)
 * @param {string} message - SMS message content
 * @returns {Promise<object>} - Response from Beem API
 */
const sendSMS = async (phoneNumber, message) => {
    try {
        // Validate credentials
        if (!BEEM_API_KEY || !BEEM_SECRET_KEY) {
            console.error('⚠️ Beem Africa credentials not configured');
            return {
                success: false,
                error: 'SMS service not configured',
            };
        }

        // Format phone number (remove leading 0, add 255 for Tanzania)
        let formattedPhone = phoneNumber.replace(/\s/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '255' + formattedPhone.substring(1);
        }
        if (!formattedPhone.startsWith('255')) {
            formattedPhone = '255' + formattedPhone;
        }

        // Prepare request payload (Beem Africa format)
        const payload = {
            source_addr: BEEM_SENDER_ID,
            schedule_time: '',
            encoding: 0,
            message: message,
            recipients: [
                {
                    recipient_id: '1',
                    dest_addr: formattedPhone,
                },
            ],
        };

        // Make API request
        const response = await axios.post(BEEM_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${BEEM_API_KEY}:${BEEM_SECRET_KEY}`).toString('base64')}`,
            },
            timeout: 10000, // 10 seconds timeout
        });

        console.log('✅ SMS sent successfully to', formattedPhone);
        return {
            success: true,
            data: response.data,
            phone: formattedPhone,
        };
    } catch (error) {
        console.error('❌ SMS Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        return {
            success: false,
            error: error.message,
            details: error.response?.data,
        };
    }
};

/**
 * Send login notification to admin
 * @param {string} userName - Name of user who logged in
 * @param {string} loginTime - Login timestamp
 * @param {string} userType - Type of user (hairdresser, admin, etc.)
 */
const sendLoginNotification = async (userName, loginTime, userType = 'hairdresser') => {
    const message = `GUGU LOGIN ALERT\n\nUser: ${userName}\nType: ${userType}\nTime: ${loginTime}\n\n- Gugu Beauty Saloon`;

    return await sendSMS(ADMIN_PHONE, message);
};

/**
 * Send welcome SMS to user after login
 * @param {string} phoneNumber - User's phone number
 * @param {string} userName - User's name
 */
const sendWelcomeSMS = async (phoneNumber, userName) => {
    const message = `Welcome back ${userName}! You have successfully logged in to Gugu Beauty Saloon.`;

    return await sendSMS(phoneNumber, message);
};

/**
 * Send order confirmation to customer
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} customerName - Customer's name
 * @param {string} serviceName - Service/hairstyle name
 * @param {string} hairdresserName - Hairdresser name
 * @param {string} receiptNumber - Receipt/order number
 * @param {string} amount - Service amount
 */
const sendOrderConfirmation = async (phoneNumber, customerName, serviceName, hairdresserName, receiptNumber, amount) => {
    const formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const whatsappLink = process.env.WHATSAPP_CHANNEL_LINK || 'https://whatsapp.com/channel/0029VazU6ccC5dJ1v2HwJE1g';

    const message = `Dear ${customerName},\n\nYour order has been confirmed!\n\nReceipt: ${receiptNumber}\nService: ${serviceName}\nHairdresser: ${hairdresserName}\nAmount: ${formattedAmount} Tsh\n\nJoin our WhatsApp channel for updates, promotions & beauty tips:\n${whatsappLink}\n\nThank you for choosing Gugu Beauty Saloon!`;

    return await sendSMS(phoneNumber, message);
};

module.exports = {
    sendSMS,
    sendLoginNotification,
    sendWelcomeSMS,
    sendOrderConfirmation,
};

