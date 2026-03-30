import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client for OAuth operations
export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(supabaseUrl, serviceKey);
}

// Type definitions matching existing schema
export type Database = {
  public: {
    Tables: {
      oauth_clients: {
        Row: {
          id: string;
          client_id: string;
          client_secret: string;
          client_name: string;
          client_description: string | null;
          client_logo_url: string | null;
          redirect_uris: string[];
          allowed_scopes: string[];
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          client_secret: string;
          client_name: string;
          client_description?: string | null;
          client_logo_url?: string | null;
          redirect_uris: string[];
          allowed_scopes: string[];
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          client_name?: string;
          client_description?: string | null;
          client_logo_url?: string | null;
          redirect_uris?: string[];
          allowed_scopes?: string[];
          updated_at?: string;
        };
      };
      oauth_authorizations: {
        Row: {
          id: string;
          authorization_code: string;
          client_id: string;
          user_id: string;
          redirect_uri: string;
          scopes: string;
          expires_at: string;
          code_challenge: string | null;
          code_challenge_method: string | null;
          created_at: string;
          used_at: string | null;
        };
        Insert: {
          id?: string;
          authorization_code: string;
          client_id: string;
          user_id: string;
          redirect_uri: string;
          scopes: string;
          expires_at: string;
          code_challenge?: string | null;
          code_challenge_method?: string | null;
          created_at?: string;
          used_at?: string | null;
        };
      };
      access_tokens: {
        Row: {
          id: string;
          token: string;
          client_id: string;
          user_id: string;
          scopes: string;
          expires_at: string;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          token: string;
          client_id: string;
          user_id: string;
          scopes: string;
          expires_at: string;
          created_at?: string;
          revoked_at?: string | null;
        };
      };
      refresh_tokens: {
        Row: {
          id: string;
          token: string;
          access_token_id: string;
          client_id: string;
          user_id: string;
          expires_at: string;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          token: string;
          access_token_id: string;
          client_id: string;
          user_id: string;
          expires_at: string;
          created_at?: string;
          revoked_at?: string | null;
        };
      };
    };
  };
};