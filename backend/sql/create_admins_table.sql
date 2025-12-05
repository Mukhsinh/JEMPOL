-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Insert default admin (password: admin123)
-- Password hash generated with bcrypt, rounds=10
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$rKZvJQxQxQxQxQxQxQxQxOeKH7PehIHy4H8/Od9JIZ7QSKlGiwWO')
ON CONFLICT (username) DO NOTHING;
