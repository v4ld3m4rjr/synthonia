/*
# Criação da tabela de sessões de treinamento

1. Nova Tabela
   - `training_sessions`
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key para users)
     - `date` (date)
     - `duration` (integer em minutos)
     - `rpe` (integer 1-10)
     - `training_type` (text)
     - `volume` (numeric, opcional)
     - `intensity` (numeric, opcional)
     - `tss` (integer, Training Stress Score)
     - `notes` (text, opcional)
     - `created_at` (timestamp)

2. Segurança
   - Enable RLS na tabela `training_sessions`
   - Políticas similares às outras tabelas
*/

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
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can read own training sessions"
  ON training_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own training sessions"
  ON training_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own training sessions"
  ON training_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own training sessions"
  ON training_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Política para treinadores
CREATE POLICY "Coaches can read athletes training sessions"
  ON training_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = training_sessions.user_id 
      AND users.coach_id = auth.uid()
    )
  );

-- Função para calcular TSS automaticamente se não fornecido
CREATE OR REPLACE FUNCTION calculate_tss()
RETURNS TRIGGER AS $$
BEGIN
  -- Se TSS não foi fornecido, calcular baseado em duração e RPE
  IF NEW.tss = 0 OR NEW.tss IS NULL THEN
    NEW.tss := ROUND((NEW.duration * NEW.rpe * NEW.rpe) / 100.0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular TSS automaticamente
CREATE TRIGGER calculate_tss_trigger
  BEFORE INSERT OR UPDATE ON training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_tss();

-- Índices
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_date ON training_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_type ON training_sessions(training_type);