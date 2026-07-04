-- Migration: Add configurable/throttled admin order-alert SMS settings
-- Date: 2026-07-03
-- Description: Per-branch settings for the admin "NEW ORDER ALERT" SMS —
--              configurable message template + minimum interval between sends.

ALTER TABLE `branch`
ADD COLUMN `sms_alert_interval_minutes` INT NOT NULL DEFAULT 60 COMMENT 'Minimum minutes between admin order-alert SMS for this branch',
ADD COLUMN `sms_alert_template` TEXT DEFAULT NULL COMMENT 'Admin order-alert SMS template with {placeholders}',
ADD COLUMN `sms_alert_last_sent_at` DATETIME DEFAULT NULL COMMENT 'When the admin order-alert SMS was last sent for this branch';

UPDATE `branch` SET `sms_alert_template` = 'NEW ORDER ALERT

Receipt: {receipt}
Customer: {customer}
Service: {service}
Amount: {amount} Tsh
Hairdresser: {hairdresser}
Branch: {branchName}
Time: {time}

TODAY''S TOTALS:
Orders: {orderCount}
Revenue: {revenue} Tsh
Office Amount: {office} Tsh
Hairdresser Amount: {hairdresserAmount} Tsh
Expenses: {expenses} Tsh

NET PROFIT: {netProfit} Tsh

- Gugu Beauty Saloon'
WHERE `sms_alert_template` IS NULL;
