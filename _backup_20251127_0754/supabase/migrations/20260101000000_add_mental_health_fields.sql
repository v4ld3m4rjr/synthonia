/*
# Add Mental Health Fields and Clinical Assessments

1. Update `daily_data` table
   - Add columns for mental health monitoring
   - Add columns for sleep details

2. Create `clinical_assessments` table
   - Store results for Weekly, Monthly, Quarterly assessments
   - Use JSONB for detailed answers
*/

-- Add new columns to daily_data
ALTER TABLE daily_data 
ADD COLUMN IF NOT EXISTS sleep_duration numeric(4,1), -- Hours
ADD COLUMN IF NOT EXISTS sleep_regularity integer CHECK (sleep_regularity >= 0 AND sleep_regularity <= 100), -- 0-100 as per spec (though 0-10 in current UI, spec says 0-100 for sleep note, but spec also says '0-10' for regularity elsewhere? Let's follow spec: "Sono (Nota): 0 a 100". "Sono (Horas)". "Regularidade" isn't explicitly 0-100 in spec, but "Sono (Nota)" is. Wait, spec says "Sono (Nota): 0 a 100". But current UI has sleep_quality 1-10. I will keep existing and add new specific ones if needed. 
-- Spec says:
-- A. Biológico & Sinais Vitais
-- Sono (Horas): Copiar do App/Relógio.
-- Sono (Nota): 0 a 100 (Do App).
-- Stress (App): 0 a 100.
-- FC Repouso: Batimentos por minuto ao acordar (Do App).

-- B. Bipolaridade (Energia & Humor)
-- Energia (0-10)
-- Humor Depre (0-10)
-- Euforia/Mania (0-10)
-- Irritabilidade (0-10)

-- C. Neurodivergência
-- Ansiedade (0-10)
-- Pensamentos Obsessivos - TOC (0-10)
-- Sobrecarga Sensorial - Autismo (0-10)
-- Masking Social - Autismo (0-10)

-- D. Segurança
-- Risco Suicídio (0-10)

ADD COLUMN IF NOT EXISTS sleep_score integer CHECK (sleep_score >= 0 AND sleep_score <= 100),
ADD COLUMN IF NOT EXISTS stress_score integer CHECK (stress_score >= 0 AND stress_score <= 100), -- "Stress (App): 0 a 100"
ADD COLUMN IF NOT EXISTS energy_level integer CHECK (energy_level >= 0 AND energy_level <= 10),
ADD COLUMN IF NOT EXISTS mood_depressed integer CHECK (mood_depressed >= 0 AND mood_depressed <= 10),
ADD COLUMN IF NOT EXISTS mood_euphoria integer CHECK (mood_euphoria >= 0 AND mood_euphoria <= 10),
ADD COLUMN IF NOT EXISTS irritability integer CHECK (irritability >= 0 AND irritability <= 10),
ADD COLUMN IF NOT EXISTS anxiety integer CHECK (anxiety >= 0 AND anxiety <= 10),
ADD COLUMN IF NOT EXISTS obsessive_thoughts integer CHECK (obsessive_thoughts >= 0 AND obsessive_thoughts <= 10),
ADD COLUMN IF NOT EXISTS sensory_overload integer CHECK (sensory_overload >= 0 AND sensory_overload <= 10),
ADD COLUMN IF NOT EXISTS social_masking integer CHECK (social_masking >= 0 AND social_masking <= 10),
ADD COLUMN IF NOT EXISTS suicide_risk integer CHECK (suicide_risk >= 0 AND suicide_risk <= 10);

-- Create clinical_assessments table
CREATE TABLE IF NOT EXISTS clinical_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('PHQ-9', 'GAD-7', 'ASRM', 'FAST', 'Y-BOCS', 'CAT-Q', 'RAADS-R')),
  total_score numeric NOT NULL,
  answers jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clinical_assessments ENABLE ROW LEVEL SECURITY;

-- Policies for clinical_assessments
CREATE POLICY "Users can read own clinical assessments"
  ON clinical_assessments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clinical assessments"
  ON clinical_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clinical assessments"
  ON clinical_assessments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Coaches can read athletes clinical assessments"
  ON clinical_assessments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = clinical_assessments.user_id 
      AND users.coach_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_user_date ON clinical_assessments(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_type ON clinical_assessments(type);
