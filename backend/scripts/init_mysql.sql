-- CashRegister — one-time MySQL setup.
-- Log in as root and run this once:
--   mysql -u root -p < backend/scripts/init_mysql.sql

CREATE DATABASE IF NOT EXISTS cashregister
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'cashregister'@'localhost' IDENTIFIED BY 'cashregister';
CREATE USER IF NOT EXISTS 'cashregister'@'%'         IDENTIFIED BY 'cashregister';

GRANT ALL PRIVILEGES ON cashregister.* TO 'cashregister'@'localhost';
GRANT ALL PRIVILEGES ON cashregister.* TO 'cashregister'@'%';
FLUSH PRIVILEGES;

SELECT '✅ Database "cashregister" is ready.' AS Message;
