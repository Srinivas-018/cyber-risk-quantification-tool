-- Seed default accounts with BCrypt-encoded password 'admin'
-- Hash: $2a$10$gRstV.a/x87L0PZ0Xm.0KexrYhPZl/iWlG4k0u7w/3O80nKx6v1lq matches password 'admin'
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2a$10$gRstV.a/x87L0PZ0Xm.0KexrYhPZl/iWlG4k0u7w/3O80nKx6v1lq', 'admin@internship.com', 'ADMIN'),
('user', '$2a$10$gRstV.a/x87L0PZ0Xm.0KexrYhPZl/iWlG4k0u7w/3O80nKx6v1lq', 'user@internship.com', 'USER');
