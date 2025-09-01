/*
  # Create training sessions table

  1. New Tables
    - `training_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `date` (date)
      - `session_name` (text)
      - `duration_minutes` (integer)
      - `rpe` (integer, 1-10 scale)
      - `exercises` (jsonb array)
      - `total_tonnage` (numeric)
      - `density` (numeric)
      - `session_load` (numeric)
      - `notes` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `training_sessions` table
    - Add policies for user data access
*/

-- Create training sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  session_name text NOT NULL,
  duration_minutes integer CHECK (duration_minutes > 0) NOT NULL,
  rpe integer CHECK (rpe >= 1 AND rpe <= 10) NOT NULL,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_tonnage numeric(10,2) DEFAULT 0,
  density numeric(6,2) DEFAULT 0,
  session_load numeric(8,2) DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own training sessions" 
  ON training_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training sessions" 
  ON training_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training sessions" 
  ON training_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training sessions" 
  ON training_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trainers can view their linked athletes' training sessions
CREATE POLICY "Trainers can view linked athletes training sessions" 
  ON training_sessions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = training_sessions.user_id 
      AND profiles.linked_to = auth.uid()
    )
  );