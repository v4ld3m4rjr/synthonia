-- Fix for 500 Error on Signup (Empty string to UUID cast)
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, doctor_id, coach_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'subject'),
    new.raw_user_meta_data->>'full_name',
    NULLIF(new.raw_user_meta_data->>'doctor_id', '')::uuid, -- Convert empty string to NULL
    NULLIF(new.raw_user_meta_data->>'coach_id', '')::uuid   -- Convert empty string to NULL
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log the error so we can see it in Supabase logs, but don't break auth entirely if possible
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
