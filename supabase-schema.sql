-- ============================================
-- MINIMAL MIGRATION: Add Token Tables Only
-- Extends existing oauth_clients and oauth_authorizations
-- ============================================

-- Access Tokens Table
CREATE TABLE IF NOT EXISTS access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scopes TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  access_token_id UUID NOT NULL REFERENCES access_tokens(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_access_tokens_token ON access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_access_tokens_user ON access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_client ON access_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_expires ON access_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_access ON refresh_tokens(access_token_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_client ON refresh_tokens(client_id);

-- Row Level Security Policies
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tokens
CREATE POLICY "Users can view own access tokens"
  ON access_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own refresh tokens"
  ON refresh_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all tokens (for API endpoints)
CREATE POLICY "Service role can manage access tokens"
  ON access_tokens FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage refresh tokens"
  ON refresh_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE access_tokens IS 'OAuth 2.0 access tokens for third-party application access';
COMMENT ON TABLE refresh_tokens IS 'OAuth 2.0 refresh tokens for obtaining new access tokens';