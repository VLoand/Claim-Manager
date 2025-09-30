-- Initialize Claims Manager Database
\c claims_manager;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    amount DECIMAL(10,2),
    claim_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create services table (commented out - for exam activation)
/*
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample services data
INSERT INTO services (service_name, service_type) VALUES
('Health Insurance Claims', 'Insurance'),
('Auto Insurance Claims', 'Insurance'),
('Property Insurance Claims', 'Insurance'),
('Legal Consultation', 'Legal'),
('Document Review', 'Administrative'),
('Customer Support', 'Support');
*/

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_documents_claim_id ON documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert sample users (for development/testing)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@claimsmanager.com', '$2b$10$rQ8K1jZq8qZGqjGm8QjGzeHgH8P7wPzPkA1yG2M8xO6ZqGH5XqGXm', 'System Administrator', 'admin'),
('johndoe', 'john@example.com', '$2b$10$rQ8K1jZq8qZGqjGm8QjGzeHgH8P7wPzPkA1yG2M8xO6ZqGH5XqGXm', 'John Doe', 'user'),
('janedoe', 'jane@example.com', '$2b$10$rQ8K1jZq8qZGqjGm8QjGzeHgH8P7wPzPkA1yG2M8xO6ZqGH5XqGXm', 'Jane Doe', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert sample claims
INSERT INTO claims (user_id, title, description, status, amount) VALUES
((SELECT id FROM users WHERE username = 'johndoe'), 'Car Accident Claim', 'Minor fender bender on Highway 101', 'pending', 2500.00),
((SELECT id FROM users WHERE username = 'janedoe'), 'Medical Expense Claim', 'Annual check-up and dental work', 'approved', 850.00),
((SELECT id FROM users WHERE username = 'johndoe'), 'Home Damage Claim', 'Water damage from pipe burst', 'under_review', 5200.00)
ON CONFLICT DO NOTHING;