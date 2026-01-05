-- =====================================================
-- Synthonia 2.0 - Optimized Database Schema
-- =====================================================

-- 1. PROFILES (formerly users)
-- Extends auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('athlete', 'coach')),
  avatar_url text,
  coach_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. DAILY ASSESSMENTS (formerly daily_data)
CREATE TABLE IF NOT EXISTS public.daily_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  
  -- Wellness Metrics (1-10)
  sleep_quality integer CHECK (sleep_quality BETWEEN 1 AND 10),
  fatigue integer CHECK (fatigue BETWEEN 1 AND 10),
  soreness integer CHECK (soreness BETWEEN 1 AND 10),
  stress integer CHECK (stress BETWEEN 1 AND 10),
  mood integer CHECK (mood BETWEEN 1 AND 10),
  
  -- Physiological Metrics
  resting_hr integer,
  hrv numeric(5,2),
  
  -- Calculated
  readiness_score numeric(5,2),
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(athlete_id, date)
);

-- RLS for daily_assessments
ALTER TABLE public.daily_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can CRUD own assessments" 
ON public.daily_assessments FOR ALL 
USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches can view their athletes assessments" 
ON public.daily_assessments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = daily_assessments.athlete_id 
    AND coach_id = auth.uid()
  )
);

-- 3. TRAINING LOGS (formerly training_sessions)
CREATE TABLE IF NOT EXISTS public.training_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  
  session_type text NOT NULL, -- e.g., 'Strength', 'Cardio', 'Recovery'
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  rpe integer CHECK (rpe BETWEEN 1 AND 10),
  
  -- Calculated Load (duration * rpe)
  load numeric(10,2),
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for training_logs
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can CRUD own logs" 
ON public.training_logs FOR ALL 
USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches can view their athletes logs" 
ON public.training_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = training_logs.athlete_id 
    AND coach_id = auth.uid()
  )
);

-- 4. FUNCTIONS & TRIGGERS

-- Auto-calculate Readiness Score
CREATE OR REPLACE FUNCTION calculate_readiness()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple weighted average algorithm
  -- (Sleep + Mood + (10-Fatigue) + (10-Soreness) + (10-Stress)) / 5 * 10
  -- This is a placeholder logic, can be refined
  NEW.readiness_score := (
    COALESCE(NEW.sleep_quality, 5) + 
    COALESCE(NEW.mood, 5) + 
    (11 - COALESCE(NEW.fatigue, 5)) + 
    (11 - COALESCE(NEW.soreness, 5)) + 
    (11 - COALESCE(NEW.stress, 5))
  ) / 5.0 * 10.0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_readiness
BEFORE INSERT OR UPDATE ON public.daily_assessments
FOR EACH ROW EXECUTE FUNCTION calculate_readiness();

-- Auto-calculate Training Load
CREATE OR REPLACE FUNCTION calculate_load()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.duration_minutes IS NOT NULL AND NEW.rpe IS NOT NULL THEN
    NEW.load := NEW.duration_minutes * NEW.rpe;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_load
BEFORE INSERT OR UPDATE ON public.training_logs
FOR EACH ROW EXECUTE FUNCTION calculate_load();

-- Handle New User (Profile Creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
