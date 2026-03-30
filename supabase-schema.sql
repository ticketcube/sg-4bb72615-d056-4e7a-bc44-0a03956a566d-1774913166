-- OAuth Applications Table
CREATE TABLE IF NOT EXISTS oauth_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_id TEXT UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uris TEXT[] NOT NULL,
  homepage_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Authorization Codes Table
CREATE TABLE IF NOT EXISTS authorization_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL REFERENCES oauth_applications(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  scope TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Access Tokens Table
CREATE TABLE IF NOT EXISTS access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL REFERENCES oauth_applications(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  access_token_id UUID NOT NULL REFERENCES access_tokens(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES oauth_applications(client_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_applications_user_id ON oauth_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_applications_client_id ON oauth_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_authorization_codes_code ON authorization_codes(code);
CREATE INDEX IF NOT EXISTS idx_authorization_codes_user_id ON authorization_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_token ON access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_access_tokens_user_id ON access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- Row Level Security (RLS) Policies
ALTER TABLE oauth_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own applications
CREATE POLICY "Users can view own applications" ON oauth_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" ON oauth_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON oauth_applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" ON oauth_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Authorization codes policies (system managed)
CREATE POLICY "Users can view own authorization codes" ON authorization_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Access tokens policies (system managed)
CREATE POLICY "Users can view own access tokens" ON access_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Refresh tokens policies (system managed)
CREATE POLICY "Users can view own refresh tokens" ON refresh_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_oauth_applications_updated_at
  BEFORE UPDATE ON oauth_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();