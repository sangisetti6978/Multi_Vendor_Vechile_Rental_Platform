-- Seed data for Vehicle Rental Platform (PostgreSQL)
-- Insert default admin user (password: admin123) only if not exists
INSERT INTO users (id, email, password, full_name, phone, role, is_verified, is_active, created_at, updated_at)
VALUES (
    nextval('users_seq'),
    'admin@vehiclerental.com',
    '$2a$10$xZJ5K6qY7N8KTL3wP7MjVOXh8WqYx5N7H4L2K9J5N6M8P7Q9R0S1T',
    'System Admin',
    NULL,
    'ADMIN',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;
