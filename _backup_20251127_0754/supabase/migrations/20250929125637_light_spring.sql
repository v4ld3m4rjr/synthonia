/*
# Criação da tabela de usuários

1. Nova Tabela
   - `users`
     - `id` (uuid, primary key)
     - `email` (text, único)
     - `name` (text)
     - `role` (enum: athlete, coach, physiotherapist)
     - `coach_id` (uuid, foreign key opcional)
     - `avatar_url` (text, opcional)
     - `created_at` (timestamp)

2. Segurança
   - Enable RLS na tabela `users`
   - Política para usuários autenticados lerem seus próprios dados
   - Política para treinadores verem dados dos seus atletas
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('athlete', 'coach', 'physiotherapist')),
  coach_id uuid REFERENCES users(id),
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para usuários lerem seus próprios dados
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política para inserir seus próprios dados  
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Política para atualizar seus próprios dados
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Política para treinadores verem dados dos seus atletas
CREATE POLICY "Coaches can read their athletes data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users coach 
      WHERE coach.id = auth.uid() 
      AND coach.role = 'coach'
      AND users.coach_id = coach.id
    )
  );