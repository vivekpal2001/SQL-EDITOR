-- Create database if not exists
CREATE DATABASE IF NOT EXISTS sqleditor;

-- Use the database
USE sqleditor;

-- Create a sample table for testing
CREATE TABLE IF NOT EXISTS sample_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO sample_users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Johnson', 'bob@example.com');

-- Grant privileges
GRANT ALL PRIVILEGES ON sqleditor.* TO 'sqluser'@'%';
FLUSH PRIVILEGES;
