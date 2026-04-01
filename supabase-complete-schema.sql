-- ============================================
-- COMPLETE FANDRAGON OAUTH PROVIDER SCHEMA
-- ============================================

-- OAuth Clients Table (Third-party applications)
CREATE TABLE IF NOT EXISTS oauth_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL UNIQUE,
  client_secret TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_description TEXT,
  client_logo_url TEXT,
  redirect_uris TEXT[] NOT NULL,
  allowed_scopes TEXT[] DEFAULT ARRAY['openid', 'profile', 'email'],
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_redirect_uris CHECK (array_length(redirect_uris, 1) > 0)
);

-- OAuth Authorization Codes Table
CREATE TABLE IF NOT EXISTS oauth_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  scopes TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

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

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_oauth_clients_user ON oauth_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_clients_client_id ON oauth_clients(client_id);

CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_code ON oauth_authorizations(code);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_client ON oauth_authorizations(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_user ON oauth_authorizations(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_expires ON oauth_authorizations(expires_at);

CREATE INDEX IF NOT EXISTS idx_access_tokens_token ON access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_access_tokens_user ON access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_client ON access_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_expires ON access_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_access ON refresh_tokens(access_token_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_client ON refresh_tokens(client_id);

-- Row Level Security Policies
ALTER TABLE oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own OAuth clients
CREATE POLICY "Users can view own oauth clients"
  ON oauth_clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create oauth clients"
  ON oauth_clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own oauth clients"
  ON oauth_clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own oauth clients"
  ON oauth_clients FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all records (for OAuth endpoints)
CREATE POLICY "Service role can manage oauth clients"
  ON oauth_clients FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage authorizations"
  ON oauth_authorizations FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage access tokens"
  ON access_tokens FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage refresh tokens"
  ON refresh_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- Users can view their own authorizations
CREATE POLICY "Users can view own authorizations"
  ON oauth_authorizations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own tokens
CREATE POLICY "Users can view own access tokens"
  ON access_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own refresh tokens"
  ON refresh_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Comments for Documentation
COMMENT ON TABLE oauth_clients IS 'Third-party applications registered with FanDragon OAuth';
COMMENT ON TABLE oauth_authorizations IS 'OAuth 2.0 authorization codes for code exchange';
COMMENT ON TABLE access_tokens IS 'OAuth 2.0 access tokens for third-party application access';
COMMENT ON TABLE refresh_tokens IS 'OAuth 2.0 refresh tokens for obtaining new access tokens';