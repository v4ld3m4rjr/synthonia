/*
  # Create pain entries table

  1. New Tables
    - `pain_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `date` (date)
      - `body_area` (text)
      - `pain_intensity` (integer, 1-10 scale)
      - `pain_type` (text)
      - `description` (text, optional)
      - `coordinates_x` (numeric, for body map positioning)
      - `coordinates_y` (numeric, for body map positioning)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `pain_entries` table
    - Add policies for user data access
*/

-- Create pain entries table
CREATE TABLE IF NOT EXISTS pain_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  body_area text NOT NULL,
  pain_intensity integer CHECK (pain_intensity >= 1 AND pain_intensity <= 10) NOT NULL,
  pain_type text NOT NULL,
  description text,
  coordinates_x numeric(5,2) NOT NULL,
  coordinates_y numeric(5,2) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE pain_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pain entries" 
  ON pain_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pain entries" 
  ON pain_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pain entries" 
  ON pain_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pain entries" 
  ON pain_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Physiotherapists and trainers can view their linked athletes' pain entries
CREATE POLICY "Professionals can view linked athletes pain entries" 
  ON pain_entries 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = pain_entries.user_id 
      AND profiles.linked_to = auth.uid()
    )
  );