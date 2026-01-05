-- Synthonia Database Schema
-- Combined migration script to fix missing tables and triggers

-- 1. Users Table
create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  name text,
  birth_date date,
  role text check (role in ('athlete','coach','physiotherapist')) default 'athlete',
  coach_id uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  avatar_url text
);

alter table public.users enable row level security;

create policy "Users can select own profile" on public.users for select to authenticated using (id = auth.uid());
create policy "Users can insert own profile" on public.users for insert to authenticated with check (id = auth.uid());
create policy "Users can update own profile" on public.users for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create index if not exists users_email_idx on public.users (email);
create index if not exists users_role_idx on public.users (role);

-- Coach access policies
create policy "Coaches can read their athletes data" on users for select to authenticated using (
    exists (select 1 from users coach where coach.id = auth.uid() and coach.role = 'coach' and users.coach_id = coach.id)
);

-- Anon access for signup (to list coaches)
create policy "Anon can select coaches" on public.users for select to anon using (role = 'coach');


-- 2. Daily Data Table
CREATE TABLE IF NOT EXISTS daily_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  sleep_quality integer NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  fatigue_level integer NOT NULL CHECK (fatigue_level >= 1 AND fatigue_level <= 10),
  mood integer NOT NULL CHECK (mood >= 1 AND mood <= 10),
  muscle_soreness integer NOT NULL CHECK (muscle_soreness >= 1 AND muscle_soreness <= 10),
  stress_level integer NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  resting_hr integer,
  hrv numeric(5,2),
  readiness_score integer DEFAULT 50 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  created_at timestamptz DEFAULT now(),
  
  -- New fields
  sleep_duration numeric(4,1),
  sleep_regularity integer CHECK (sleep_regularity >= 1 AND sleep_regularity <= 10),
  exhaustion integer CHECK (exhaustion >= 1 AND exhaustion <= 10),
  tqr numeric(4,1) CHECK (tqr >= 0 AND tqr <= 10),
  psr numeric(4,1) CHECK (psr >= 0 AND psr <= 10),

  UNIQUE(user_id, date)
);

ALTER TABLE daily_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily data" ON daily_data FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own daily data" ON daily_data FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own daily data" ON daily_data FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Coaches can read athletes daily data" ON daily_data FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = daily_data.user_id AND users.coach_id = auth.uid())
);

-- Trigger for readiness score
CREATE OR REPLACE FUNCTION calculate_readiness_score() RETURNS TRIGGER AS $$
BEGIN
  NEW.readiness_score := ROUND((NEW.sleep_quality * 20 + (11 - NEW.fatigue_level) * 20 + NEW.mood * 20 + (11 - NEW.muscle_soreness) * 20 + (11 - NEW.stress_level) * 20) / 5.0);
  NEW.readiness_score := GREATEST(0, LEAST(100, NEW.readiness_score));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_readiness_score_trigger ON daily_data;
CREATE TRIGGER calculate_readiness_score_trigger BEFORE INSERT OR UPDATE ON daily_data FOR EACH ROW EXECUTE FUNCTION calculate_readiness_score();

CREATE INDEX IF NOT EXISTS idx_daily_data_user_date ON daily_data(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_data_psr ON daily_data (psr);


-- 3. Training Sessions Table
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  rpe integer NOT NULL CHECK (rpe >= 1 AND rpe <= 10),
  training_type text NOT NULL DEFAULT 'Geral',
  volume numeric(10,2),
  intensity numeric(5,2),
  tss integer DEFAULT 0 CHECK (tss >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),

  -- New fields
  pse numeric(4,1) CHECK (pse >= 0 AND pse <= 10),
  trimp integer DEFAULT 0 CHECK (trimp >= 0)
);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own training sessions" ON training_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own training sessions" ON training_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own training sessions" ON training_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own training sessions" ON training_sessions FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Coaches can read athletes training sessions" ON training_sessions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = training_sessions.user_id AND users.coach_id = auth.uid())
);

-- Trigger for TSS
CREATE OR REPLACE FUNCTION calculate_tss() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tss = 0 OR NEW.tss IS NULL THEN
    NEW.tss := ROUND((NEW.duration * NEW.rpe * NEW.rpe) / 100.0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_tss_trigger ON training_sessions;
CREATE TRIGGER calculate_tss_trigger BEFORE INSERT OR UPDATE ON training_sessions FOR EACH ROW EXECUTE FUNCTION calculate_tss();

CREATE INDEX IF NOT EXISTS idx_training_sessions_user_date ON training_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_pse ON training_sessions (pse);
CREATE INDEX IF NOT EXISTS idx_training_sessions_trimp ON training_sessions (trimp);


-- 4. Auth Trigger (Critical for Signup)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, coach_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'coach_id' IS NOT NULL AND NEW.raw_user_meta_data->>'coach_id' != '' 
      THEN (NEW.raw_user_meta_data->>'coach_id')::uuid
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
