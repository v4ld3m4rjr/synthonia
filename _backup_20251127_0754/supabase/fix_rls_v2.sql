-- ==============================================================================
-- FIX RLS RECURSION AND 500 ERRORS (VERSION 2 - ROBUST)
-- ==============================================================================
-- This script fixes the infinite recursion in RLS policies by introducing
-- SECURITY DEFINER functions that bypass RLS for role checks.
-- ==============================================================================

-- 1. Create a secure function to check user role without triggering RLS
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER -- IMPORTANT: Runs with privileges of the creator (postgres), bypassing RLS
STABLE
AS $$
  SELECT role FROM users WHERE id = user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO anon;

-- 2. Drop ALL existing problematic policies on 'users' to ensure a clean slate
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Coaches can read their athletes data" ON users;
DROP POLICY IF EXISTS "Anonymous can select coaches" ON users;
DROP POLICY IF EXISTS "Authenticated can select coaches or own" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- 3. Recreate policies using the secure function or simplified logic

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Coaches can read their athletes' data
-- Uses the SECURITY DEFINER function to check if the current user is a coach
-- AND checks if the target user has this coach assigned.
CREATE POLICY "Coaches can read their athletes data"
  ON users FOR SELECT
  TO authenticated
  USING (
    (get_user_role(auth.uid()) = 'coach' AND coach_id = auth.uid())
    OR
    (auth.uid() = id) -- Always allow reading own data
  );

-- Policy: Anyone can see coaches (needed for selection during signup/profile)
CREATE POLICY "Anyone can see coaches"
  ON users FOR SELECT
  USING (role = 'coach');

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can insert their own data (registration)
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Fix policies for other tables (daily_data, training_sessions) to ensure consistency

-- Daily Data
DROP POLICY IF EXISTS "Users can read own daily data" ON daily_data;
DROP POLICY IF EXISTS "Coaches can read athletes daily data" ON daily_data;
DROP POLICY IF EXISTS "Users can insert own daily data" ON daily_data;
DROP POLICY IF EXISTS "Users can update own daily data" ON daily_data;

CREATE POLICY "Users can read own daily data"
  ON daily_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can read athletes daily data"
  ON daily_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = daily_data.user_id
      AND users.coach_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own daily data"
  ON daily_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily data"
  ON daily_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Training Sessions
DROP POLICY IF EXISTS "Users can read own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Coaches can read athletes training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can insert own training sessions" ON training_sessions;
DROP POLICY IF EXISTS "Users can update own training sessions" ON training_sessions;

CREATE POLICY "Users can read own training sessions"
  ON training_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can read athletes training sessions"
  ON training_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = training_sessions.user_id
      AND users.coach_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own training sessions"
  ON training_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training sessions"
  ON training_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
