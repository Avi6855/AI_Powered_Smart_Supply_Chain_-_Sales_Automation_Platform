-- =============================================================================
-- V4__security_audit_logs.sql
-- Audit log for access attempts (successful + unauthorized)
-- =============================================================================

CREATE TABLE security_audit_logs (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT REFERENCES users(id) ON DELETE SET NULL,
    email         VARCHAR(150),
    role          VARCHAR(30),
    method        VARCHAR(10)  NOT NULL,
    path          VARCHAR(500) NOT NULL,
    status        INTEGER      NOT NULL,
    allowed       BOOLEAN      NOT NULL,
    reason        VARCHAR(300),
    client_ip     VARCHAR(64),
    user_agent    VARCHAR(500),
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_created_at ON security_audit_logs(created_at);
CREATE INDEX idx_security_audit_logs_path ON security_audit_logs(path);

