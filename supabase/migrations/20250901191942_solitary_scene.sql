/*
  # Create sleep entries table

  1. New Tables
    - `sleep_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `date` (date)
      - `bedtime` (time)
      - `wake_time` (time)
      - `sleep_duration` (numeric, in hours)
      - `sleep_quality` (integer, 1-10 scale)
      - `sleep_efficiency` (numeric, percentage)
      - `deep_sleep_minutes` (integer, optional)
      - `rem_sleep_minutes` (integer, optional)
      - `awakenings` (integer, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `sleep_entries` table
    - Add policies for user data access
*/

-- Create sleep entries table
CREATE TABLE IF NOT EXISTS sleep_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  bedtime time NOT NULL,
  wake_time time NOT NULL,
  sleep_duration numeric(4,2) CHECK (sleep_duration > 0) NOT NULL,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10) NOT NULL,
  sleep_efficiency numeric(5,2) CHECK (sleep_efficiency >= 0 AND sleep_efficiency <= 100),
  deep_sleep_minutes integer CHECK (deep_sleep_minutes >= 0),
  rem_sleep_minutes integer CHECK (rem_sleep_minutes >= 0),
  awakenings integer CHECK (awakenings >= 0),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own sleep entries" 
  ON sleep_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep entries" 
  ON sleep_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries" 
  ON sleep_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries" 
  ON sleep_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trainers can view their linked athletes' sleep entries
CREATE POLICY "Trainers can view linked athletes sleep entries" 
  ON sleep_entries 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = sleep_entries.user_id 
      AND profiles.linked_to = auth.uid()
    )
  );