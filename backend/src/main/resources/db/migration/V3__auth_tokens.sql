-- =============================================================================
-- V3__auth_tokens.sql
-- Persist access (bearer) tokens for revocation + auditability
-- =============================================================================

CREATE TABLE auth_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT         UNIQUE NOT NULL,
    expires_at  TIMESTAMP    NOT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    revoked     BOOLEAN      DEFAULT FALSE
);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX idx_auth_tokens_revoked ON auth_tokens(revoked);

