-- PostgreSQL Initialization Script
\c sqleditor;

-- Create sqluser if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sqluser') THEN
        CREATE ROLE sqluser WITH LOGIN PASSWORD 'sqlpassword' SUPERUSER;
    END IF;
END
$$;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE sqleditor TO postgres;
GRANT ALL PRIVILEGES ON DATABASE sqleditor TO sqluser;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO sqluser;

-- Create sample table
CREATE TABLE IF NOT EXISTS sample_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO sample_users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Johnson', 'bob@example.com')
ON CONFLICT (email) DO NOTHING;

-- Grant permissions on tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sqluser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sqluser;
