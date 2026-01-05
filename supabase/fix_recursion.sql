-- Fix Infinite Recursion in RLS

-- 1. Drop the problematic function if it exists
DROP FUNCTION IF EXISTS public.is_professional_linked(uuid);

-- 2. Recreate it with SECURITY DEFINER and a clean search_path
-- This ensures it runs with owner privileges and bypasses the RLS recursion loop
CREATE OR REPLACE FUNCTION public.is_professional_linked(patient_uuid UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Direct query to avoid RLS loop
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = patient_uuid
    AND (doctor_id = auth.uid() OR coach_id = auth.uid())
  );
END;
$$;

-- 3. Just to be safe, ensure policies are using this function correctly
-- (No changes needed to policies if they already call is_professional_linked)
