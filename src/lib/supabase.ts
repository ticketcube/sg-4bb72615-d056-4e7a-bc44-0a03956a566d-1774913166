import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      oauth_applications: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          client_id: string;
          client_secret: string;
          redirect_uris: string[];
          homepage_url: string | null;
          status: "active" | "inactive";
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          client_id: string;
          client_secret: string;
          redirect_uris: string[];
          homepage_url?: string | null;
          status?: "active" | "inactive";
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          client_id?: string;
          client_secret?: string;
          redirect_uris?: string[];
          homepage_url?: string | null;
          status?: "active" | "inactive";
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      authorization_codes: {
        Row: {
          id: string;
          code: string;
          client_id: string;
          user_id: string;
          redirect_uri: string;
          scope: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          client_id: string;
          user_id: string;
          redirect_uri: string;
          scope: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          client_id?: string;
          user_id?: string;
          redirect_uri?: string;
          scope?: string;
          expires_at?: string;
          used?: boolean;
          created_at?: string;
        };
      };
      access_tokens: {
        Row: {
          id: string;
          token: string;
          client_id: string;
          user_id: string;
          scope: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          client_id: string;
          user_id: string;
          scope: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          client_id?: string;
          user_id?: string;
          scope?: string;
          expires_at?: string;
          created_at?: string;
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
        };
        Insert: {
          id?: string;
          token: string;
          access_token_id: string;
          client_id: string;
          user_id: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          access_token_id?: string;
          client_id?: string;
          user_id?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
    };
  };
};