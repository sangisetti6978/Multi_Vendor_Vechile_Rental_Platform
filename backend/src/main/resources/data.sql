-- Seed data for Vehicle Rental Platform (H2 compatible)
-- Insert default admin user (password: admin123) only if not exists
MERGE INTO users (id, email, password, full_name, phone, role, is_verified, is_active, created_at, updated_at)
KEY (email)
VALUES (
    NEXT VALUE FOR users_seq,
    'admin@vehiclerental.com',
    '$2a$10$xZJ5K6qY7N8KTL3wP7MjVOXh8WqYx5N7H4L2K9J5N6M8P7Q9R0S1T',
    'System Admin',
    NULL,
    'ADMIN',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
