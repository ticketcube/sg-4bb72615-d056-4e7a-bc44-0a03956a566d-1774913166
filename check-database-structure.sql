-- ============================================
-- DATABASE STRUCTURE CHECK SCRIPT
-- Run this in Supabase SQL Editor and share the results
-- ============================================

-- 1. List all tables in public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Show columns for oauth_clients table (if exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'oauth_clients'
ORDER BY ordinal_position;

-- 3. Show columns for oauth_authorizations table (if exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'oauth_authorizations'
ORDER BY ordinal_position;

-- 4. Show columns for access_tokens table (if exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'access_tokens'
ORDER BY ordinal_position;

-- 5. Show columns for refresh_tokens table (if exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'refresh_tokens'
ORDER BY ordinal_position;

-- 6. Show all indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. Show all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. Check if tables have RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;