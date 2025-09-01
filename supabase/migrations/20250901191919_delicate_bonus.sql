/*
  # Create recovery entries table

  1. New Tables
    - `recovery_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `date` (date)
      - `sleep_quality` (integer, 1-10 scale)
      - `fatigue_level` (integer, 1-10 scale)
      - `muscle_soreness` (integer, 1-10 scale)
      - `stress_level` (integer, 1-10 scale)
      - `mood_level` (integer, 1-10 scale)
      - `prs_score` (numeric, calculated readiness score)
      - `notes` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `recovery_entries` table
    - Add policies for user data access
*/

-- Create recovery entries table
CREATE TABLE IF NOT EXISTS recovery_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10) NOT NULL,
  fatigue_level integer CHECK (fatigue_level >= 1 AND fatigue_level <= 10) NOT NULL,
  muscle_soreness integer CHECK (muscle_soreness >= 1 AND muscle_soreness <= 10) NOT NULL,
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10) NOT NULL,
  mood_level integer CHECK (mood_level >= 1 AND mood_level <= 10) NOT NULL,
  prs_score numeric(4,2) NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE recovery_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own recovery entries" 
  ON recovery_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recovery entries" 
  ON recovery_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recovery entries" 
  ON recovery_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recovery entries" 
  ON recovery_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trainers can view their linked athletes' recovery entries
CREATE POLICY "Trainers can view linked athletes recovery entries" 
  ON recovery_entries 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = recovery_entries.user_id 
      AND profiles.linked_to = auth.uid()
    )
  );