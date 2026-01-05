-- =====================================================
-- Fix RLS Recursion and Policies
-- =====================================================

-- 1. Create a secure function to check user role without triggering RLS
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER -- Runs with privileges of the creator (postgres), bypassing RLS
STABLE
AS $$
  SELECT role FROM users WHERE id = user_id;
$$;

-- 2. Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Coaches can read their athletes data" ON users;
DROP POLICY IF EXISTS "Authenticated can select coaches or own" ON users;

-- 3. Re-create policies using the secure function or simplified logic

-- Policy for coaches to read their athletes
CREATE POLICY "Coaches can read their athletes data"
  ON users FOR SELECT
  TO authenticated
  USING (
    -- Check if the current user is a coach AND the target user has them as coach
    (get_user_role(auth.uid()) = 'coach' AND coach_id = auth.uid())
  );

-- Policy for reading coaches (simplified)
CREATE POLICY "Authenticated can select coaches"
  ON users FOR SELECT
  TO authenticated
  USING (
    role = 'coach'
  );

-- 4. Fix Daily Data Policies
DROP POLICY IF EXISTS "Coaches can read their athletes daily data" ON daily_data;

CREATE POLICY "Coaches can read their athletes daily data"
  ON daily_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = daily_data.user_id
      AND users.coach_id = auth.uid()
      -- We don't need to check if auth.uid() is a coach here because only a coach would be in the coach_id column
    )
  );

-- 5. Fix Training Sessions Policies
DROP POLICY IF EXISTS "Coaches can read their athletes training sessions" ON training_sessions;

CREATE POLICY "Coaches can read their athletes training sessions"
  ON training_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = training_sessions.user_id
      AND users.coach_id = auth.uid()
    )
  );

-- 6. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role TO anon;
