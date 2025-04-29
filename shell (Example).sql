-- RUN SCRIPT FROM HERE to Line 31 Only

CREATE DATABASE zerotrace;
USE zerotrace;

CREATE TABLE p_log_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    files TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_files TEXT NOT NULL
);

CREATE TABLE uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    files TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_files TEXT NOT NULL
);

CREATE TABLE upload_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    upload_time DATETIME,
    token VARCHAR(255),
    FOREIGN KEY (token) REFERENCES uploads(token) ON DELETE CASCADE
);



-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

SHOW databases;
-- USE <Your DB NAME as here its zerotrace>;
USE zerotrace;

-- Show table columns
DESCRIBE uploads;

-- Show full table creation SQL
SHOW CREATE TABLE uploads;

-- View all data
SELECT * FROM p_log_admin;
SELECT * FROM uploads;
SELECT * FROM upload_logs;

-- Delete all data
DELETE FROM uploads;
DELETE FROM upload_logs;

-- Show indexes
SHOW INDEX FROM p_log_admin;
SHOW INDEX FROM uploads;
SHOW INDEX FROM upload_logs;

-- Show all foreign keys in current DB
SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'zerotrace';

-- Reset Specific User Value (Upload Limit)
SET SQL_SAFE_UPDATES = 0;
DELETE FROM uploads WHERE ip_address = '::1';
DELETE FROM upload_logs WHERE ip_address = '::1';

-- Reset all users values (Upload Limit)
SET SQL_SAFE_UPDATES = 0;
DELETE FROM uploads;
DELETE FROM upload_logs;

-- Reset whole database
SET SQL_SAFE_UPDATES = 0;
DELETE FROM p_log_admin;
DELETE FROM uploads;
DELETE FROM upload_logs;