-- Create Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- Create Assets Table (with Risk Quantification columns)
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    asset_name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    description TEXT,
    risk_level VARCHAR(20) NOT NULL,
    risk_score INTEGER NOT NULL,
    vulnerabilities TEXT,
    impact TEXT,
    deleted BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Audit Logs Table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(20) NOT NULL,
    action_details TEXT,
    performed_by VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_assets_deleted ON assets(deleted);
CREATE INDEX idx_assets_risk_level ON assets(risk_level);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
