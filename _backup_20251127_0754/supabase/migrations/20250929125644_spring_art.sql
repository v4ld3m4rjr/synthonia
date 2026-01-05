/*
# Criação da tabela de dados diários

1. Nova Tabela
   - `daily_data`
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key para users)
     - `date` (date, único por usuário)
     - `sleep_quality` (integer 1-10)
     - `fatigue_level` (integer 1-10)
     - `mood` (integer 1-10)
     - `muscle_soreness` (integer 1-10)
     - `stress_level` (integer 1-10)
     - `resting_hr` (integer, opcional)
     - `hrv` (numeric, opcional)
     - `readiness_score` (integer 0-100)
     - `created_at` (timestamp)

2. Segurança
   - Enable RLS na tabela `daily_data`
   - Políticas para CRUD baseadas no user_id
*/

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
  UNIQUE(user_id, date)
);

ALTER TABLE daily_data ENABLE ROW LEVEL SECURITY;

-- Política para usuários lerem seus próprios dados
CREATE POLICY "Users can read own daily data"
  ON daily_data
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Política para inserir dados
CREATE POLICY "Users can insert own daily data"
  ON daily_data
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Política para atualizar dados
CREATE POLICY "Users can update own daily data"
  ON daily_data
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Política para treinadores verem dados dos seus atletas
CREATE POLICY "Coaches can read athletes daily data"
  ON daily_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = daily_data.user_id 
      AND users.coach_id = auth.uid()
    )
  );

-- Função para calcular readiness score automaticamente
CREATE OR REPLACE FUNCTION calculate_readiness_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Fórmula: média ponderada das variáveis (algumas invertidas)
  NEW.readiness_score := ROUND(
    (NEW.sleep_quality * 20 + 
     (11 - NEW.fatigue_level) * 20 + 
     NEW.mood * 20 + 
     (11 - NEW.muscle_soreness) * 20 + 
     (11 - NEW.stress_level) * 20) / 5.0
  );
  
  -- Garantir que está entre 0 e 100
  NEW.readiness_score := GREATEST(0, LEAST(100, NEW.readiness_score));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automaticamente o readiness score
CREATE TRIGGER calculate_readiness_score_trigger
  BEFORE INSERT OR UPDATE ON daily_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_readiness_score();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_daily_data_user_date ON daily_data(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_data_date ON daily_data(date DESC);