-- Migration to fix roles and add coach_id
-- Run this in Supabase SQL Editor if you already have the tables created

-- 1. Update Profiles Table Structure
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('subject', 'doctor', 'coach'));

-- Add coach_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'coach_id') THEN
        ALTER TABLE public.profiles ADD COLUMN coach_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- 2. Update Policies (Drop existing first to avoid errors, then recreate)

-- Drop policies that might conflict or be outdated
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate Profile Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Update the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, doctor_id, coach_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'subject'), -- Default to subject
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'doctor_id')::uuid,
    (new.raw_user_meta_data->>'coach_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
