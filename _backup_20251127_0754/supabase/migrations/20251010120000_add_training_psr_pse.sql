/*
# Add new fields for PSR (daily recovery) and PSE/TRIMP (training)

1. Alter daily_data
   - Add sleep_duration (numeric)
   - Add sleep_regularity (integer 1-10)
   - Add exhaustion (integer 1-10)
   - Add tqr (numeric 0-10)
   - Add psr (numeric 0-10)

2. Alter training_sessions
   - Add pse (numeric 0-10)
   - Add trimp (integer >= 0)
*/

-- daily_data additions
ALTER TABLE IF EXISTS public.daily_data
  ADD COLUMN IF NOT EXISTS sleep_duration numeric(4,1),
  ADD COLUMN IF NOT EXISTS sleep_regularity integer CHECK (sleep_regularity >= 1 AND sleep_regularity <= 10),
  ADD COLUMN IF NOT EXISTS exhaustion integer CHECK (exhaustion >= 1 AND exhaustion <= 10),
  ADD COLUMN IF NOT EXISTS tqr numeric(4,1) CHECK (tqr >= 0 AND tqr <= 10),
  ADD COLUMN IF NOT EXISTS psr numeric(4,1) CHECK (psr >= 0 AND psr <= 10);

-- training_sessions additions
ALTER TABLE IF EXISTS public.training_sessions
  ADD COLUMN IF NOT EXISTS pse numeric(4,1) CHECK (pse >= 0 AND pse <= 10),
  ADD COLUMN IF NOT EXISTS trimp integer DEFAULT 0 CHECK (trimp >= 0);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_daily_data_psr ON public.daily_data (psr);
CREATE INDEX IF NOT EXISTS idx_training_sessions_pse ON public.training_sessions (pse);
CREATE INDEX IF NOT EXISTS idx_training_sessions_trimp ON public.training_sessions (trimp);