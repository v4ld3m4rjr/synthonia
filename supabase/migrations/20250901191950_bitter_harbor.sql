/*
  # Create AI insights table

  1. New Tables
    - `ai_insights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `insight_type` (text)
      - `title` (text)
      - `content` (text)
      - `data_sources` (text array)
      - `confidence_score` (numeric, 0-1 scale)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ai_insights` table
    - Add policies for user data access
*/

-- Create AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  insight_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  data_sources text[] NOT NULL DEFAULT '{}',
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own AI insights" 
  ON ai_insights 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI insights for users" 
  ON ai_insights 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can delete their own AI insights" 
  ON ai_insights 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trainers and physiotherapists can view their linked athletes' AI insights
CREATE POLICY "Professionals can view linked athletes AI insights" 
  ON ai_insights 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = ai_insights.user_id 
      AND profiles.linked_to = auth.uid()
    )
  );