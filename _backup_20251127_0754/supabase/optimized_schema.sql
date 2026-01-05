-- =====================================================
-- Synthonia - Optimized Database Schema
-- Consolidated and optimized from multiple migrations
-- =====================================================

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('athlete', 'coach', 'physiotherapist')),
  coach_id uuid REFERENCES users(id) ON DELETE SET NULL,
  avatar_url text,
  birth_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_coach_id ON users(coach_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Coaches can read their athletes data" ON users;
CREATE POLICY "Coaches can read their athletes data"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users coach 
      WHERE coach.id = auth.uid() 
      AND coach.role = 'coach'
      AND users.coach_id = coach.id
    )
  );

DROP POLICY IF EXISTS "Anonymous can select coaches" ON users;
CREATE POLICY "Anonymous can select coaches"
  ON users FOR SELECT
  TO anon
  USING (role = 'coach');

DROP POLICY IF EXISTS "Authenticated can select coaches or own" ON users;
CREATE POLICY "Authenticated can select coaches or own"
  ON users FOR SELECT
  TO authenticated
  USING (role = 'coach' OR auth.uid() = id);

-- =====================================================
-- 2. DAILY DATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_duration numeric(4,2),
  sleep_regularity integer CHECK (sleep_regularity BETWEEN 1 AND 10),
  fatigue_level integer CHECK (fatigue_level BETWEEN 1 AND 10),
  exhaustion integer CHECK (exhaustion BETWEEN 1 AND 10),
  mood integer CHECK (mood BETWEEN 1 AND 10),
  muscle_soreness integer CHECK (muscle_soreness BETWEEN 1 AND 10),
  stress_level integer CHECK (stress_level BETWEEN 1 AND 10),
  resting_hr integer CHECK (resting_hr > 0),
  hrv numeric(5,2) CHECK (hrv >= 0),
  tqr integer CHECK (tqr BETWEEN 6 AND 20),
  psr integer CHECK (psr BETWEEN 0 AND 100),
  readiness_score numeric(5,2) CHECK (readiness_score BETWEEN 0 AND 100),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Indexes for daily_data table
CREATE INDEX IF NOT EXISTS idx_daily_data_user_id ON daily_data(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_data_date ON daily_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_data_user_date ON daily_data(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_data_created_at ON daily_data(created_at DESC);

-- Enable RLS
ALTER TABLE daily_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_data
DROP POLICY IF EXISTS "Users can read own daily data" ON daily_data;
CREATE POLICY "Users can read own daily data"
  ON daily_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own daily data" ON daily_data;
CREATE POLICY "Users can insert own daily data"
  ON daily_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own daily data" ON daily_data;
CREATE POLICY "Users can update own daily data"
  ON daily_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own daily data" ON daily_data;
CREATE POLICY "Users can delete own daily data"
  ON daily_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can read their athletes daily data" ON daily_data;
CREATE POLICY "Coaches can read their athletes daily data"
  ON daily_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = daily_data.user_id 
      AND users.coach_id = auth.uid()
    )
  );

-- =====================================================
-- 3. TRAINING SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  rpe integer CHECK (rpe BETWEEN 1 AND 10),
  training_type text NOT NULL,
  volume numeric(10,2),
  intensity numeric(5,2),
  tss numeric(6,2) CHECK (tss >= 0),
  pse integer CHECK (pse >= 0),
  trimp numeric(6,2) CHECK (trimp >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for training_sessions table
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_date ON training_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_type ON training_sessions(training_type);
CREATE INDEX IF NOT EXISTS idx_training_sessions_created_at ON training_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_sessions
DROP POLICY IF EXISTS "Users can read own training sessions" ON training_sessions;
CREATE POLICY "Users can read own training sessions"
  ON training_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own training sessions" ON training_sessions;
CREATE POLICY "Users can insert own training sessions"
  ON training_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own training sessions" ON training_sessions;
CREATE POLICY "Users can update own training sessions"
  ON training_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own training sessions" ON training_sessions;
CREATE POLICY "Users can delete own training sessions"
  ON training_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

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

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function to calculate readiness score
CREATE OR REPLACE FUNCTION calculate_readiness_score()
RETURNS TRIGGER AS $$
DECLARE
  score numeric(5,2);
BEGIN
  -- Calculate weighted average of wellness metrics
  score := (
    COALESCE(NEW.sleep_quality, 5) * 0.25 +
    COALESCE(NEW.fatigue_level, 5) * 0.20 +
    COALESCE(NEW.mood, 5) * 0.15 +
    COALESCE(NEW.muscle_soreness, 5) * 0.15 +
    COALESCE(NEW.stress_level, 5) * 0.15 +
    COALESCE(NEW.hrv, 50) / 10 * 0.10
  ) * 10;
  
  -- Ensure score is between 0 and 100
  NEW.readiness_score := LEAST(GREATEST(score, 0), 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate TSS (Training Stress Score)
CREATE OR REPLACE FUNCTION calculate_tss()
RETURNS TRIGGER AS $$
BEGIN
  -- TSS = (duration in hours × intensity × 100)
  IF NEW.duration IS NOT NULL AND NEW.rpe IS NOT NULL THEN
    NEW.tss := (NEW.duration::numeric / 60.0) * (NEW.rpe::numeric / 10.0) * 100;
  END IF;
  
  -- Calculate PSE (Perceived Session Exertion)
  IF NEW.duration IS NOT NULL AND NEW.rpe IS NOT NULL THEN
    NEW.pse := NEW.duration * NEW.rpe;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, coach_id, birth_date)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'coach_id' IS NOT NULL 
      AND NEW.raw_user_meta_data->>'coach_id' != '' 
      THEN (NEW.raw_user_meta_data->>'coach_id')::uuid
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      AND NEW.raw_user_meta_data->>'birth_date' != '' 
      THEN (NEW.raw_user_meta_data->>'birth_date')::date
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for readiness score calculation
DROP TRIGGER IF EXISTS calculate_readiness_score_trigger ON daily_data;
CREATE TRIGGER calculate_readiness_score_trigger
  BEFORE INSERT OR UPDATE ON daily_data
  FOR EACH ROW EXECUTE FUNCTION calculate_readiness_score();

-- Trigger for TSS calculation
DROP TRIGGER IF EXISTS calculate_tss_trigger ON training_sessions;
CREATE TRIGGER calculate_tss_trigger
  BEFORE INSERT OR UPDATE ON training_sessions
  FOR EACH ROW EXECUTE FUNCTION calculate_tss();

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_data_updated_at ON daily_data;
CREATE TRIGGER update_daily_data_updated_at
  BEFORE UPDATE ON daily_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_sessions_updated_at ON training_sessions;
CREATE TRIGGER update_training_sessions_updated_at
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. HELPER VIEWS (Optional - for analytics)
-- =====================================================

-- View for athlete dashboard summary
CREATE OR REPLACE VIEW athlete_summary AS
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(DISTINCT dd.id) as total_daily_entries,
  COUNT(DISTINCT ts.id) as total_training_sessions,
  AVG(dd.readiness_score) as avg_readiness,
  SUM(ts.tss) as total_tss_7days
FROM users u
LEFT JOIN daily_data dd ON u.id = dd.user_id AND dd.date >= CURRENT_DATE - INTERVAL '7 days'
LEFT JOIN training_sessions ts ON u.id = ts.user_id AND ts.date >= CURRENT_DATE - INTERVAL '7 days'
WHERE u.role = 'athlete'
GROUP BY u.id, u.name, u.email;

-- =====================================================
-- NOTES
-- =====================================================
-- This schema includes:
-- 1. Optimized indexes for common queries
-- 2. Proper foreign key constraints with CASCADE
-- 3. Check constraints for data validation
-- 4. RLS policies for security
-- 5. Triggers for automatic calculations
-- 6. Updated_at timestamps for audit trail
-- 7. Helper views for analytics
--
-- To apply this schema:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all tables, indexes, and policies are created
-- 3. Test with sample data
-- =====================================================
