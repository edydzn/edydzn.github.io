/*
  # Add RLS Policies for kv_store_bdae3ab6

  1. Purpose
    - This table stores Figma Make data as key-value pairs
    - Table has `owner_id` column for ownership tracking
    - Currently accessed via edge functions using service_role key
    - Proper RLS policies ensure data isolation between users

  2. Security Changes
    - Add policy: Users can only read their own data
    - Add policy: Users can only insert their own data  
    - Add policy: Users can only update their own data
    - Add policy: Users can only delete their own data
    - All policies check owner_id matches auth.uid()

  3. Important Notes
    - Edge functions using service_role bypass RLS
    - These policies protect direct table access via client SDK
    - owner_id must be set when inserting data
*/

-- Policy: Users can only read their own key-value pairs
CREATE POLICY "Users can read own kv data"
  ON public.kv_store_bdae3ab6
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Policy: Users can only insert their own data (owner_id must match their user ID)
CREATE POLICY "Users can insert own kv data"
  ON public.kv_store_bdae3ab6
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Policy: Users can only update their own data
CREATE POLICY "Users can update own kv data"
  ON public.kv_store_bdae3ab6
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy: Users can only delete their own data
CREATE POLICY "Users can delete own kv data"
  ON public.kv_store_bdae3ab6
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());