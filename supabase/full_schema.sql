-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
-- Updated to support 'subject', 'doctor', 'coach'
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('subject', 'doctor', 'coach')),
    full_name TEXT,
    birth_date DATE,
    gender TEXT,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    profile_type TEXT DEFAULT 'Sujeito',
    doctor_id UUID REFERENCES public.profiles(id), -- Link to Doctor
    coach_id UUID REFERENCES public.profiles(id),  -- Link to Coach
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Daily Metrics Physical
CREATE TABLE public.daily_metrics_physical (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) NOT NULL,
    date DATE NOT NULL,
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 0 AND 10),
    sleep_start TIME,
    sleep_end TIME,
    fatigue_physical INTEGER CHECK (fatigue_physical BETWEEN 0 AND 10),
    stress_mental INTEGER CHECK (stress_mental BETWEEN 0 AND 10),
    doms_pain INTEGER CHECK (doms_pain BETWEEN 0 AND 10),
    mood_general INTEGER CHECK (mood_general BETWEEN 0 AND 10),
    readiness_to_train INTEGER CHECK (readiness_to_train BETWEEN 0 AND 10),
    perception_recovery_prs INTEGER CHECK (perception_recovery_prs BETWEEN 0 AND 10),
    resting_hr INTEGER,
    hrv NUMERIC, -- Heart Rate Variability
    jump_test_result NUMERIC,
    -- Training Load Metrics
    daily_load_arbitrary NUMERIC, -- Daily load (e.g. Duration * RPE)
    ctl NUMERIC, -- Chronic Training Load (Fitness)
    atl NUMERIC, -- Acute Training Load (Fatigue)
    tsb NUMERIC, -- Training Stress Balance (Form)
    daily_monotony NUMERIC,
    weekly_monotony NUMERIC,
    daily_strain NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(patient_id, date)
);

-- 3. Daily Metrics Mental
CREATE TABLE public.daily_metrics_mental (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) NOT NULL,
    date DATE NOT NULL,
    sleep_hours_log NUMERIC,
    sleep_score_app INTEGER CHECK (sleep_score_app BETWEEN 0 AND 100),
    stress_score_app INTEGER CHECK (stress_score_app BETWEEN 0 AND 100),
    energy_level INTEGER CHECK (energy_level BETWEEN 0 AND 10),
    depression_mood INTEGER CHECK (depression_mood BETWEEN 0 AND 10),
    mania_euphoria INTEGER CHECK (mania_euphoria BETWEEN 0 AND 10),
    irritability INTEGER CHECK (irritability BETWEEN 0 AND 10),
    anxiety INTEGER CHECK (anxiety BETWEEN 0 AND 10),
    obsessive_thoughts INTEGER CHECK (obsessive_thoughts BETWEEN 0 AND 10),
    sensory_overload INTEGER CHECK (sensory_overload BETWEEN 0 AND 10),
    social_masking INTEGER CHECK (social_masking BETWEEN 0 AND 10),
    suicide_risk INTEGER CHECK (suicide_risk BETWEEN 0 AND 10),
    medication_taken BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(patient_id, date)
);

-- 4. Training Sessions
CREATE TABLE public.training_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER,
    session_rpe INTEGER CHECK (session_rpe BETWEEN 0 AND 10),
    session_load NUMERIC, -- Derived: duration * rpe
    exercises_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Spravato Sessions
CREATE TABLE public.spravato_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    dose_mg NUMERIC,
    dissociation_level INTEGER CHECK (dissociation_level BETWEEN 0 AND 10),
    nausea_physical INTEGER CHECK (nausea_physical BETWEEN 0 AND 10),
    bp_pre TEXT,
    bp_post TEXT,
    trip_quality TEXT,
    insights TEXT,
    mood_24h_after INTEGER CHECK (mood_24h_after BETWEEN -5 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Clinical Assessments
CREATE TABLE public.clinical_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) NOT NULL,
    date DATE NOT NULL,
    type TEXT CHECK (type IN (
        -- Depressão
        'PHQ9', 'HAMD', 'MADRS', 'QIDSSR',
        -- Mania
        'PMQ9', 'ASRM', 'YMRS', 'ASERT',
        -- Bipolaridade
        'ISS', 'FAST',
        -- TOC
        'OCIR', 'MOCI', 'OCCDS', 'YBOCS',
        -- Autismo
        'RAADS', 'SPQ', 'ASDQ', 'APDQ', 'SAB',
        -- Ansiedade
        'GAD7',
        -- Qualidade de vida
        'EQ5D5L', 'QLDS', 'WHOQOLBREF',
        -- Satisfação
        'TSQM9',
        -- Funcionamento Global
        'GAF',
        -- Efeitos Adversos
        'ADVERSE_CHECKLIST', 'CADSS6', 'LCQ'
    )),
    raw_scores JSONB DEFAULT '{}'::jsonb,
    total_score NUMERIC,
    burnout_index INTEGER CHECK (burnout_index BETWEEN 0 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics_physical ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics_mental ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spravato_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_assessments ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is the patient's doctor OR coach
CREATE OR REPLACE FUNCTION is_professional_linked(patient_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = patient_uuid
    AND (doctor_id = auth.uid() OR coach_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- General Policy Generator for Patient Data Tables
-- (Simplifying repetitive code for brevity, but listing explicitly for clarity)

-- Physical Metrics
CREATE POLICY "Patients view own physical" ON public.daily_metrics_physical FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Pros view linked physical" ON public.daily_metrics_physical FOR SELECT USING (is_professional_linked(patient_id));
CREATE POLICY "Patients insert own physical" ON public.daily_metrics_physical FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients update own physical" ON public.daily_metrics_physical FOR UPDATE USING (auth.uid() = patient_id);

-- Mental Metrics
CREATE POLICY "Patients view own mental" ON public.daily_metrics_mental FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Pros view linked mental" ON public.daily_metrics_mental FOR SELECT USING (is_professional_linked(patient_id));
CREATE POLICY "Patients insert own mental" ON public.daily_metrics_mental FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients update own mental" ON public.daily_metrics_mental FOR UPDATE USING (auth.uid() = patient_id);

-- Training
CREATE POLICY "Patients view own training" ON public.training_sessions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Pros view linked training" ON public.training_sessions FOR SELECT USING (is_professional_linked(patient_id));
CREATE POLICY "Patients insert own training" ON public.training_sessions FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients update own training" ON public.training_sessions FOR UPDATE USING (auth.uid() = patient_id);

-- Spravato
CREATE POLICY "Patients view own spravato" ON public.spravato_sessions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Pros view linked spravato" ON public.spravato_sessions FOR SELECT USING (is_professional_linked(patient_id));
CREATE POLICY "Patients insert own spravato" ON public.spravato_sessions FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients update own spravato" ON public.spravato_sessions FOR UPDATE USING (auth.uid() = patient_id);

-- Trigger to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, doctor_id, coach_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'subject'), -- Default to subject
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'doctor_id')::uuid,
    (new.raw_user_meta_data->>'coach_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
