-- MIGRATION SCRIPT: Run this to update your existing database safely
-- Identifies changes and applies them without breaking existing tables

-- 1. Update Clinical Assessments: Allow new Questionnaire Types
-- We drop the old check constraint and add the new extended one
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clinical_assessments_type_check') THEN
        ALTER TABLE public.clinical_assessments DROP CONSTRAINT clinical_assessments_type_check;
    END IF;
END $$;

ALTER TABLE public.clinical_assessments ADD CONSTRAINT clinical_assessments_type_check CHECK (type IN (
    'PHQ9', 'HAMD', 'MADRS', 'QIDSSR',
    'PMQ9', 'ASRM', 'YMRS', 'ASERT',
    'ISS', 'FAST',
    'OCIR', 'MOCI', 'OCCDS', 'YBOCS',
    'RAADS', 'SPQ', 'ASDQ', 'APDQ', 'SAB',
    'GAD7',
    'EQ5D5L', 'QLDS', 'WHOQOLBREF',
    'TSQM9',
    'GAF',
    'ADVERSE_CHECKLIST', 'CADSS6', 'LCQ'
));

-- 2. Update Physical Metrics: Add Training Load Columns
-- Using DO block to avoid errors if columns already exist (safe for all Postgres versions)
ALTER TABLE public.daily_metrics_physical ADD COLUMN IF NOT EXISTS hrv NUMERIC;
ALTER TABLE public.daily_metrics_physical ADD COLUMN IF NOT EXISTS daily_load_arbitrary NUMERIC;
ALTER TABLE public.daily_metrics_physical ADD COLUMN IF NOT EXISTS ctl NUMERIC;
ALTER TABLE public.daily_metrics_physical ADD COLUMN IF NOT EXISTS atl NUMERIC;
ALTER TABLE public.daily_metrics_physical ADD COLUMN IF NOT EXISTS tsb NUMERIC;
ALTER TABLE public.daily_metrics_physical ADD COLUMN IF NOT EXISTS daily_monotony NUMERIC;
ALTER TABLE public.daily_metrics_physical ADD COLUMN IF NOT EXISTS weekly_monotony NUMERIC;
ALTER TABLE public.daily_metrics_physical ADD COLUMN IF NOT EXISTS daily_strain NUMERIC;

-- 3. Update Training Sessions
ALTER TABLE public.training_sessions ADD COLUMN IF NOT EXISTS session_load NUMERIC;

-- 4. Create Spravato Table (Only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.spravato_sessions (
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

-- Enable Security for Spravato if created
ALTER TABLE public.spravato_sessions ENABLE ROW LEVEL SECURITY;

-- Add Policies for Spravato (Start with DROP to avoid 'policy exists' error)
DROP POLICY IF EXISTS "Patients view own spravato" ON public.spravato_sessions;
CREATE POLICY "Patients view own spravato" ON public.spravato_sessions FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Patients insert own spravato" ON public.spravato_sessions;
CREATE POLICY "Patients insert own spravato" ON public.spravato_sessions FOR INSERT WITH CHECK (auth.uid() = patient_id);
