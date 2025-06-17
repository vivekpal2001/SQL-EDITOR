-- Create database if not exists (PostgreSQL creates the database from ENV var)
-- But we need to ensure the user has proper permissions

-- Create the user if it doesn't exist (this runs as postgres user)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'sqluser') THEN

      CREATE ROLE sqluser LOGIN PASSWORD 'sqlpassword';
   END IF;
END
$do$;

-- Grant superuser privileges to sqluser
ALTER USER sqluser CREATEDB CREATEROLE SUPERUSER;

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE sqleditor TO sqluser;

-- Connect to sqleditor database and set up permissions
\c sqleditor;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO sqluser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sqluser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sqluser;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sqluser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sqluser;

-- Create a sample table for testing
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

-- Grant permissions on the sample table
GRANT ALL PRIVILEGES ON sample_users TO sqluser;
GRANT USAGE, SELECT ON SEQUENCE sample_users_id_seq TO sqluser;
