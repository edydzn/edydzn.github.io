/*
  # Fix kv_store_bdae3ab6 Security Issues

  1. Security Changes
    - Enable Row Level Security (RLS) on `kv_store_bdae3ab6` table
    - Revoke all privileges from `anon` role (public access)
    - Revoke all privileges from `authenticated` role (signed-in users)
    - Keep `service_role` and `postgres` privileges for backend operations
    
  2. Important Notes
    - RLS was NOT previously enabled on this table
    - Both anon and authenticated roles had full CRUD access
    - This prevents the table from being visible in the GraphQL schema to unauthenticated and authenticated users
    - Service role can still access for backend operations
*/

-- Enable Row Level Security
ALTER TABLE public.kv_store_bdae3ab6 ENABLE ROW LEVEL SECURITY;

-- Revoke all privileges from anon role (public/unauthenticated access)
REVOKE ALL PRIVILEGES ON public.kv_store_bdae3ab6 FROM anon;

-- Revoke all privileges from authenticated role (signed-in users)
REVOKE ALL PRIVILEGES ON public.kv_store_bdae3ab6 FROM authenticated;

-- Drop existing incomplete policy if exists
DROP POLICY IF EXISTS kv_store_bdae3ab6_update_owner_only ON public.kv_store_bdae3ab6;

-- Note: No RLS policies are created because the table should NOT be accessible 
-- via GraphQL API at all. Access should only be through service_role for backend operations.
-- If specific access patterns are needed, they should be implemented via edge functions 
-- or specific policies that check ownership/membership.