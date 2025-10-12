-- Add phone numbers to existing hairdressers
-- Run this: mysql -u root -p gugu < add_phone_numbers.sql

USE gugu;

-- Update hairdressers with phone numbers
-- You can assign the admin phone to one user for testing

-- Example: Add your phone number to the first hairdresser
UPDATE hairdresser 
SET phone = '0762996305', 
    email = 'noreen@gugubeauty.com'
WHERE id = 1;

-- Add more phone numbers to other hairdressers (optional)
-- UPDATE hairdresser SET phone = '0700000001', email = 'asia@gugubeauty.com' WHERE id = 3;
-- UPDATE hairdresser SET phone = '0700000002', email = 'stamily@gugubeauty.com' WHERE id = 4;
-- UPDATE hairdresser SET phone = '0700000003', email = 'josephat@gugubeauty.com' WHERE id = 5;

-- Show updated records
SELECT id, name, phone, email FROM hairdresser;

