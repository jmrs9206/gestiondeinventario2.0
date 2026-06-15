-- Database Initialization Script

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    role VARCHAR(40) NOT NULL DEFAULT 'USER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data
INSERT INTO users (name, email, role, active)
VALUES 
    ('Admin User', 'admin@brand.com', 'ADMIN', TRUE),
    ('Jane Doe', 'jane@brand.com', 'USER', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO items (title, description, status)
VALUES 
    ('Template Item Alpha', 'This is a sample item generated automatically by the DB seeding script.', 'ACTIVE'),
    ('Template Item Beta', 'Another sample item to demonstrate list rendering and API communication.', 'PENDING')
ON CONFLICT DO NOTHING;
